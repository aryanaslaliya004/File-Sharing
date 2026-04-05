import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSocket } from './SocketContext';
import { useUser } from './UserContext';
import { v4 as uuidv4 } from 'uuid';

const ConnectionContext = createContext();

export const useConnection = () => useContext(ConnectionContext);

const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

const CHUNK_SIZE = 16 * 1024; // 16KB chunks

export const ConnectionProvider = ({ children }) => {
    const { socket } = useSocket();
    const { user } = useUser();
    const [peerConnection, setPeerConnection] = useState(null);
    const [dataChannel, setDataChannel] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('idle');
    const [connectedPeerId, setConnectedPeerId] = useState(null);
    const connectedPeerIdRef = useRef(null);
    const pendingCandidates = useRef({}); // { [peerId]: RTCIceCandidate[] }
    const [transfers, setTransfers] = useState({}); // { fileId: { ...meta, progress, type: 'incoming'|'outgoing' } }

    const pcRef = useRef(null);
    const receivedChunks = useRef({}); // { fileId: [chunks] }
    const metaData = useRef({}); // { fileId: meta }
    const activeReceiveFileId = useRef(null);
    const activeReceiveChunksReceived = useRef(0);

    const createPeerConnection = (targetId) => {
        if (pcRef.current) pcRef.current.close();

        const pc = new RTCPeerConnection(RTC_CONFIG);
        pcRef.current = pc;
        setPeerConnection(pc);
        setConnectedPeerId(targetId);
        connectedPeerIdRef.current = targetId;

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', {
                    target: targetId,
                    candidate: event.candidate,
                    sender: user.id
                });
            }
        };

        pc.onconnectionstatechange = () => {
            setConnectionStatus(pc.connectionState);
            if (pc.connectionState === 'disconnected') {
                // cleanup logic if needed
            }
        };

        return pc;
    };

    const connectToPeer = async (targetId) => {
        if (!socket) return;
        setConnectionStatus('connecting');
        const pc = createPeerConnection(targetId);

        const channel = pc.createDataChannel("file-transfer");
        setupDataChannel(channel);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('offer', {
            target: targetId,
            offer: pc.localDescription,
            sender: user.id
        });
    };

    const setupDataChannel = (channel) => {
        channel.binaryType = 'arraybuffer';
        channel.onopen = () => setConnectionStatus('connected');
        channel.onclose = () => setConnectionStatus('disconnected');

        channel.onmessage = (event) => {
            if (typeof event.data === 'string') {
                const data = JSON.parse(event.data);
                handleDataMessage(data);
            } else if (event.data instanceof ArrayBuffer) {
                handleBinaryMessage(event.data);
            }
        };

        setDataChannel(channel);
    };

    const handleDataMessage = (data) => {
        if (data.type === 'meta') {
            metaData.current[data.fileId] = data;
            setTransfers(prev => ({
                ...prev,
                [data.fileId]: { ...data, progress: 0, status: 'receiving', direction: 'incoming' },
            }));
            receivedChunks.current[data.fileId] = [];
            activeReceiveFileId.current = data.fileId;
            activeReceiveChunksReceived.current = 0;
        }
    };

    const handleBinaryMessage = (arrayBuffer) => {
        const fileId = activeReceiveFileId.current;
        if (!fileId) return;

        receivedChunks.current[fileId].push(arrayBuffer);
        activeReceiveChunksReceived.current++;

        const totalChunks = metaData.current[fileId]?.totalChunks;
        const currentCount = activeReceiveChunksReceived.current;

        if (totalChunks) {
            // Update progress occasionally
            if (currentCount % 50 === 0 || currentCount === totalChunks) {
                const progress = Math.round((currentCount / totalChunks) * 100);
                setTransfers(prev => ({
                    ...prev,
                    [fileId]: { ...prev[fileId], progress }
                }));
            }

            if (currentCount === totalChunks) {
                finishReceiving(fileId);
                activeReceiveFileId.current = null;
            }
        }
    };

    const finishReceiving = (fileId) => {
        const meta = metaData.current[fileId] || {};
        const chunks = receivedChunks.current[fileId];
        if (!chunks) return;

        try {
            const blob = new Blob(chunks, { type: meta.mimeType || 'application/octet-stream' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = meta.name || 'downloaded_file';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
            }, 100);

            setTransfers(prev => ({
                ...prev,
                [fileId]: { ...prev[fileId], status: 'completed', url, progress: 100 }
            }));
        } catch (err) {
            console.error('Failed to auto-download:', err);
        }

        delete receivedChunks.current[fileId];
        delete metaData.current[fileId];
    };

    const sendFile = async (file) => {
        if (!dataChannel || dataChannel.readyState !== 'open') return;

        const CHUNK_SIZE = 64 * 1024; // 64KB Native binary transfer
        const fileId = uuidv4();
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const displayName = file.webkitRelativePath || file.name;

        setTransfers(prev => ({
            ...prev,
            [fileId]: {
                fileId,
                name: displayName,
                size: file.size,
                mimeType: file.type,
                progress: 0,
                status: 'sending',
                direction: 'outgoing'
            }
        }));

        dataChannel.send(JSON.stringify({
            type: 'meta',
            fileId,
            name: displayName,
            size: file.size,
            mimeType: file.type,
            totalChunks
        }));

        const readConfig = async () => {
            let offset = 0;
            let chunkIndex = 0;

            while (offset < file.size) {
                // Add backpressure waiting to prevent browser Out-Of-Memory/Buffering errors
                while (dataChannel.bufferedAmount > 8 * 1024 * 1024) {
                    await new Promise(r => setTimeout(r, 10));
                }

                const slice = file.slice(offset, offset + CHUNK_SIZE);
                const arrayBuffer = await slice.arrayBuffer();

                dataChannel.send(arrayBuffer);

                offset += CHUNK_SIZE;
                chunkIndex++;

                if (chunkIndex % 50 === 0 || chunkIndex === totalChunks) {
                    const progress = Math.round((chunkIndex / totalChunks) * 100);
                    setTransfers(prev => ({
                        ...prev,
                        [fileId]: { ...prev[fileId], progress }
                    }));
                    await new Promise(r => setTimeout(r, 0));
                }
            }

            setTransfers(prev => ({
                ...prev,
                [fileId]: { ...prev[fileId], status: 'completed', progress: 100 }
            }));
        };

        readConfig();
    };

    useEffect(() => {
        if (!socket) return;
        socket.on('offer', async (data) => {
            const { offer, sender } = data;
            const pc = createPeerConnection(sender);
            pc.ondatachannel = (event) => setupDataChannel(event.channel);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            
            if (pendingCandidates.current[sender]) {
                for (const candidate of pendingCandidates.current[sender]) {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
                }
                pendingCandidates.current[sender] = [];
            }
            
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('answer', { target: sender, answer: pc.localDescription, sender: user.id });
        });
        socket.on('answer', async (data) => {
            const { answer, sender } = data;
            if (pcRef.current && connectedPeerIdRef.current === sender) {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                
                if (pendingCandidates.current[sender]) {
                    for (const candidate of pendingCandidates.current[sender]) {
                        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
                    }
                    pendingCandidates.current[sender] = [];
                }
            }
        });
        socket.on('ice-candidate', async (data) => {
            const { candidate, sender } = data;
            if (pcRef.current && connectedPeerIdRef.current === sender && pcRef.current.remoteDescription) {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
            } else {
                if (!pendingCandidates.current[sender]) pendingCandidates.current[sender] = [];
                pendingCandidates.current[sender].push(candidate);
            }
        });
        return () => { socket.off('offer'); socket.off('answer'); socket.off('ice-candidate'); };
    }, [socket, user]);

    // Persist transfers
    useEffect(() => {
        const saveHistory = () => {
            const history = JSON.parse(localStorage.getItem('p2p-transfer-history') || '[]');
            const completedTransfers = Object.values(transfers).filter(t => t.status === 'completed');

            const newHistory = [...history];
            let changed = false;

            completedTransfers.forEach(t => {
                if (!newHistory.find(h => h.fileId === t.fileId)) {
                    // Create a copy without the URL and blob data constraints (if any)
                    const { url, ...cleanTransfer } = t;
                    newHistory.push(cleanTransfer);
                    changed = true;
                }
            });

            if (changed) {
                localStorage.setItem('p2p-transfer-history', JSON.stringify(newHistory));
            }
        };

        saveHistory();
    }, [transfers]);

    return (
        <ConnectionContext.Provider value={{ connectToPeer, connectionStatus, dataChannel, connectedPeerId, sendFile, transfers }}>
            {children}
        </ConnectionContext.Provider>
    );
};

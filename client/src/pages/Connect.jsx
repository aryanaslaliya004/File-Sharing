import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, Smartphone, ArrowRight, Loader } from 'lucide-react';
import { useConnection } from '../contexts/ConnectionContext';
import './Connect.css';

const Connect = () => {
    const [peerId, setPeerId] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const { connectToPeer, connectionStatus, connectedPeerId } = useConnection();
    const navigate = useNavigate();

    useEffect(() => {
        if (connectionStatus === 'connected' && connectedPeerId) {
            navigate(`/room/${connectedPeerId}`);
        }
    }, [connectionStatus, connectedPeerId, navigate]);

    useEffect(() => {
        let scanner = null;
        if (showScanner) {
            scanner = new Html5QrcodeScanner("qr-reader", { 
                qrbox: { width: 250, height: 250 }, 
                fps: 10,
                aspectRatio: 1.0
            }, false);

            scanner.render(
                (decodedText) => {
                    setPeerId(decodedText);
                    setShowScanner(false);
                    if (scanner) {
                        try {
                            scanner.clear();
                        } catch (e) {
                            console.error("Failed to clear scanner", e);
                        }
                    }
                    setTimeout(() => {
                        connectToPeer(decodedText);
                    }, 300);
                },
                (err) => {
                    // silently ignore regular scan errors
                }
            );
        }

        return () => {
            if (scanner) {
                try {
                    scanner.clear();
                } catch (e) {
                    console.error("Cleanup error", e);
                }
            }
        };
    }, [showScanner, connectToPeer]);

    const handleConnect = () => {
        if (peerId.trim()) {
            connectToPeer(peerId);
        }
    };

    return (
        <div className="connect-container">
            <div className="connect-card">
                <h2>Connect to Peer</h2>
                <p className="subtitle">Enter the unique ID of the device you want to connect to.</p>

                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Enter Peer ID (e.g. ARYAN-4F9)"
                        value={peerId}
                        onChange={(e) => setPeerId(e.target.value)}
                    />
                </div>

                <button
                    className="action-btn primary"
                    onClick={handleConnect}
                    disabled={connectionStatus === 'connecting' || !peerId}
                >
                    {connectionStatus === 'connecting' ? (
                        <>Connecting <Loader className="spin" size={20} /></>
                    ) : (
                        <>Connect <ArrowRight size={20} /></>
                    )}
                </button>

                <div className="divider">
                    <span>OR</span>
                </div>

                <button
                    className="action-btn secondary"
                    onClick={() => setShowScanner(!showScanner)}
                >
                    <QrCode size={20} />
                    {showScanner ? 'Close Scanner' : 'Scan QR Code'}
                </button>

                {showScanner && (
                    <div className="scanner-container" style={{ marginTop: '1.5rem', width: '100%', maxWidth: '350px', background: 'white', borderRadius: '1rem', overflow: 'hidden' }}>
                        <div id="qr-reader" style={{ border: 'none' }}></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Connect;

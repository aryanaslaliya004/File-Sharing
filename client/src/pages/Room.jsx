import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useConnection } from '../contexts/ConnectionContext';
import { Upload, File, CheckCircle, Download, Folder, Smartphone } from 'lucide-react';
import './Room.css';

const Room = () => {
    const { roomId } = useParams();
    const { connectionStatus, sendFile, transfers } = useConnection();

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            Array.from(e.dataTransfer.files).forEach(file => {
                sendFile(file);
            });
        }
    }, [sendFile]);

    const handleFileSelect = (e) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(file => {
                sendFile(file);
            });
        }
    };

    const transferList = Object.values(transfers).reverse();

    return (
        <div className="room-container" onDragOver={handleDragOver} onDrop={handleDrop}>
            <header className="room-header">
                <h2>Shared Room</h2>
                <div className={`connection-badge ${connectionStatus}`}>
                    {connectionStatus === 'connected' ? 'Connected to ' + roomId : connectionStatus}
                </div>
            </header>

            <div className="upload-area">
                <Upload size={48} className="upload-icon" />
                <h3>Drop files/folders here</h3>
                <p>or select what to send:</p>
                <div className="upload-actions">
                    <label className="action-btn">
                        <File size={24} />
                        <span>Files</span>
                        <input type="file" multiple onChange={handleFileSelect} hidden />
                    </label>
                    <label className="action-btn">
                        <Folder size={24} />
                        <span>Folder</span>
                        <input type="file" webkitdirectory="" directory="" onChange={handleFileSelect} hidden />
                    </label>
                    <label className="action-btn">
                        <Smartphone size={24} />
                        <span>Apps</span>
                        <input type="file" multiple accept=".apk,.exe,.dmg,.app" onChange={handleFileSelect} hidden />
                    </label>
                </div>
            </div>

            <div className="transfers-list">
                <h3>Transfer History</h3>
                {transferList.length === 0 && <p className="empty-msg">No files transferred yet.</p>}

                {transferList.map((transfer) => (
                    <div key={transfer.fileId} className={`transfer-item ${transfer.direction}`}>
                        <div className="file-icon">
                            <File size={24} />
                        </div>
                        <div className="file-details">
                            <h4>{transfer.name}</h4>
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${transfer.progress}%` }}
                                ></div>
                            </div>
                            <span className="file-size">{formatSize(transfer.size)}</span>
                        </div>
                        <div className="transfer-actions">
                            {transfer.status === 'completed' && transfer.direction === 'incoming' && (
                                <a href={transfer.url} download={transfer.name} className="download-btn">
                                    <Download size={20} />
                                </a>
                            )}
                            {transfer.status === 'completed' && transfer.direction === 'outgoing' && (
                                <CheckCircle size={20} className="success-icon" />
                            )}
                            {transfer.status === 'sending' || transfer.status === 'receiving' ? (
                                <span className="percent">{transfer.progress}%</span>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default Room;

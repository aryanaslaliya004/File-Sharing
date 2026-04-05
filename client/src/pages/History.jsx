import React, { useEffect, useState } from 'react';
import { Clock, File, Download, ArrowUp, ArrowDown } from 'lucide-react';
import './History.css';

const History = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const storedHistory = JSON.parse(localStorage.getItem('p2p-transfer-history') || '[]');
        setHistory(storedHistory.reverse());
    }, []);

    const clearHistory = () => {
        if (window.confirm('Clear all history?')) {
            localStorage.removeItem('p2p-transfer-history');
            setHistory([]);
        }
    };

    return (
        <div className="history-container">
            <header className="history-header">
                <h2>Transfer History</h2>
                {history.length > 0 && (
                    <button className="clear-btn" onClick={clearHistory}>Clear History</button>
                )}
            </header>

            {history.length === 0 ? (
                <div className="empty-state">
                    <Clock size={48} className="empty-icon" />
                    <p>No transfer history yet</p>
                </div>
            ) : (
                <div className="history-list">
                    {history.map((item) => (
                        <div key={item.fileId} className="history-item">
                            <div className={`direction-icon ${item.direction}`}>
                                {item.direction === 'incoming' ? <ArrowDown size={20} /> : <ArrowUp size={20} />}
                            </div>
                            <div className="file-info">
                                <h4>{item.name}</h4>
                                <div className="meta">
                                    <span>{item.direction === 'incoming' ? 'Received' : 'Sent'}</span>
                                    <span className="dot">•</span>
                                    <span>{formatSize(item.size)}</span>
                                </div>
                            </div>
                            <div className="status-badge completed">Completed</div>
                        </div>
                    ))}
                </div>
            )}
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

export default History;

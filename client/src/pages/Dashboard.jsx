import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Wifi, WifiOff } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useSocket } from '../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useUser();
    const { isConnected } = useSocket();
    const navigate = useNavigate();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(user.id);
        alert('ID copied to clipboard!');
    };

    if (!user) return null; // Should be handled by protected route logic normally

    return (
        <div className="dashboard-container">
            <div className="status-bar">
                {isConnected ? (
                    <div className="status-indicator online">
                        <Wifi size={16} /> <span>Online</span>
                    </div>
                ) : (
                    <div className="status-indicator offline">
                        <WifiOff size={16} /> <span>Offline</span>
                    </div>
                )}
            </div>

            <div className="id-card">
                <div className="qr-wrapper">
                    <QRCodeSVG value={user.id} size={200} level="H" includeMargin={true} />
                </div>

                <div className="user-info">
                    <h3>{user.username}</h3>
                    <div className="id-display">
                        <span>{user.id}</span>
                        <button onClick={copyToClipboard} className="copy-btn">
                            <Copy size={16} />
                        </button>
                    </div>
                </div>

                <p className="instruction">
                    Ask your peer to scan this QR code or enter your ID on the Connect page.
                </p>

                <button className="connect-btn" onClick={() => navigate('/connect')}>
                    Scan or Connect to Peer
                </button>
            </div>
        </div>
    );
};

export default Dashboard;

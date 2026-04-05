import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { Moon, Sun, Trash2, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const { logout, registerUser, user } = useUser();
    const navigate = useNavigate();

    const handleClearHistory = () => {
        if (window.confirm('Are you sure you want to clear transfer history?')) {
            localStorage.removeItem('p2p-transfer-history');
            alert('History cleared.');
            // Force reload to reflect changes in History component if visited
            // meaningful way would be to expose clearHistory from context but this works for now
        }
    };



    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="settings-container">
            <header className="settings-header">
                <h2>Settings</h2>
            </header>

            <div className="settings-section">
                <h3>Appearance</h3>
                <div className="setting-item" onClick={toggleTheme}>
                    <div className="setting-info">
                        <div className="setting-icon">
                            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <span>Dark Mode</span>
                    </div>
                    <div className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`}>
                        <div className="toggle-thumb"></div>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <h3>Privacy & Data</h3>

                <div className="setting-item" onClick={handleClearHistory}>
                    <div className="setting-info">
                        <div className="setting-icon error"><Trash2 size={20} /></div>
                        <span className="text-error">Clear History</span>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <h3>Account</h3>
                <div className="setting-item" onClick={handleLogout}>
                    <div className="setting-info">
                        <div className="setting-icon error"><LogOut size={20} /></div>
                        <span className="text-error">Logout</span>
                    </div>
                </div>
            </div>

            <div className="app-info">
                <Shield size={16} />
                <p>FileShare v1.0.0 • Secure P2P Encrypted</p>
            </div>
        </div>
    );
};

export default Settings;

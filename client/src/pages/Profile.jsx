import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { QRCodeSVG } from 'qrcode.react';
import { User, LogOut, Edit2, Save, X, Mail, Phone, Lock, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const { user, registerUser, logout, resetPassword } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState(user?.username || '');
    
    // Password reset state
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetMessage, setResetMessage] = useState({ type: '', text: '' });
    
    const navigate = useNavigate();

    if (!user || !user.id) return null;

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/');
        }
    };

    const saveProfile = () => {
        if (newUsername.trim() && newUsername !== user.username) {
            const updatedUser = { ...user, username: newUsername };
            localStorage.setItem('p2p-file-share-user', JSON.stringify(updatedUser));
            window.location.reload(); 
        }
        setIsEditing(false);
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setResetMessage({ type: '', text: '' });
        
        if (newPassword !== confirmPassword) {
            return setResetMessage({ type: 'error', text: 'New passwords do not match' });
        }
        
        if (newPassword.length < 6) {
            return setResetMessage({ type: 'error', text: 'Password must be at least 6 characters' });
        }

        const res = await resetPassword(user.email, currentPassword, newPassword);
        
        if (res.success) {
            setResetMessage({ type: 'success', text: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setShowPasswordReset(false), 2000);
        } else {
            setResetMessage({ type: 'error', text: res.error || 'Failed to update password' });
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="avatar-large">
                    {user.avatar}
                </div>

                <div className="profile-details">
                    {isEditing ? (
                        <div className="edit-group">
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                autoFocus
                            />
                            <div className="edit-actions">
                                <button onClick={saveProfile} className="icon-btn save"><Save size={20} /></button>
                                <button onClick={() => setIsEditing(false)} className="icon-btn cancel"><X size={20} /></button>
                            </div>
                        </div>
                    ) : (
                        <h2 className="profile-name">
                            {user.username}
                            <button onClick={() => setIsEditing(true)} className="icon-btn edit">
                                <Edit2 size={16} />
                            </button>
                        </h2>
                    )}
                    <p className="profile-id">ID: {user.id}</p>
                </div>

                <div className="contact-info">
                    <div className="info-row">
                        <Mail size={18} className="info-icon" />
                        <span>{user.email || 'No email provided'}</span>
                    </div>
                    <div className="info-row">
                        <Phone size={18} className="info-icon" />
                        <span>{user.phone || 'No phone provided'}</span>
                    </div>
                </div>

                {showPasswordReset ? (
                    <div className="password-reset-section">
                        <h3>Reset Password</h3>
                        <form onSubmit={handlePasswordReset}>
                            <div className="input-group">
                                <Lock size={18} />
                                <input 
                                    type="password" 
                                    placeholder="Current Password" 
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <Key size={18} />
                                <input 
                                    type="password" 
                                    placeholder="New Password" 
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <Key size={18} />
                                <input 
                                    type="password" 
                                    placeholder="Confirm New Password" 
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            
                            {resetMessage.text && (
                                <div className={`message ${resetMessage.type}`}>
                                    {resetMessage.text}
                                </div>
                            )}
                            
                            <div className="reset-actions">
                                <button type="submit" className="save-btn">Update Password</button>
                                <button type="button" className="cancel-btn" onClick={() => setShowPasswordReset(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <button className="reset-toggle-btn" onClick={() => setShowPasswordReset(true)}>
                        <Lock size={18} /> Change Password
                    </button>
                )}

                <div className="qr-preview">
                    <QRCodeSVG value={user.id} size={150} level="M" />
                </div>

                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} /> Logout
                </button>
            </div>
        </div>
    );
};

export default Profile;

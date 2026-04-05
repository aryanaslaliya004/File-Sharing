import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Share2, Shield, Zap } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import './Landing.css';

const Landing = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.id) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="landing-container">
            <header className="landing-header">
                <div className="logo">
                    <Share2 size={32} className="logo-icon" />
                    <h1>FileShare</h1>
                </div>
                <p className="tagline">Secure. Fast. Peer-to-Peer.</p>
            </header>

            <main className="landing-main">
                <h2 className="hero-title">Share Files <span className="highlight">Instantly</span></h2>
                <p className="hero-desc">
                    Transfer files of any size directly to devices nearby or over the internet.
                    No limits, no clouds, just direct connection.
                </p>

                <button className="cta-button" onClick={() => navigate('/register')}>
                    Get Started <ArrowRight size={20} />
                </button>

                <div className="features-grid">
                    <div className="feature-card">
                        <Zap className="feature-icon" />
                        <h3>Lightning Fast</h3>
                        <p>Direct P2P transfer means maximum speed allowed by your network.</p>
                    </div>
                    <div className="feature-card">
                        <Shield className="feature-icon" />
                        <h3>Secure</h3>
                        <p>End-to-end encrypted. Your files never touch our servers.</p>
                    </div>
                    <div className="feature-card">
                        <Share2 className="feature-icon" />
                        <h3>Easy Connect</h3>
                        <p>Just scan a QR code to start sharing immediately.</p>
                    </div>
                </div>
            </main>

            <footer className="landing-footer">
                <p>&copy; 2024 FileShare P2P. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Landing;

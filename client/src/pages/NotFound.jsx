import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
    return (
        <div style={{
            textAlign: 'center',
            padding: '4rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem'
        }}>
            <AlertTriangle size={64} color="var(--secondary)" />
            <h1 style={{ fontSize: '3rem' }}>404</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Page not found</p>
            <Link to="/" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--primary)',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '2rem',
                fontWeight: '600'
            }}>
                <Home size={20} /> Return Home
            </Link>
        </div>
    );
};

export default NotFound;

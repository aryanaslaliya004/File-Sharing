import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ArrowRight } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    const { registerUser } = useUser();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        
        if (formData.name.trim() && formData.phone.trim() && formData.email.trim() && formData.password.trim()) {
            setLoading(true);
            const result = await registerUser(formData.name, formData.phone, formData.email, formData.password);
            setLoading(false);
            
            if (result.success) {
                navigate('/dashboard');
            } else {
                setErrorMsg(result.error);
            }
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <User size={48} className="register-icon" />
                    <h2>Create User ID</h2>
                    <p>Choose a display name to be identified by peers.</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    {errorMsg && <div className="error-message">{errorMsg}</div>}
                    <div className="input-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. John Doe"
                            maxLength={30}
                            required
                            autoFocus
                        />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="e.g. +1 555-0123"
                            required
                        />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="login-actions">
                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Generate ID & Continue'}
                        </button>
                    </div>
                </form>
                
                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Already have an account? 
                    <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', marginLeft: '0.5rem', fontWeight: 500 }}>Log in here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;

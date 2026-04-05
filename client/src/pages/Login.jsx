import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ArrowRight, Loader } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    const { loginUser } = useUser();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        
        if (formData.email.trim() && formData.password.trim()) {
            setLoading(true);
            const result = await loginUser(formData.email, formData.password);
            setLoading(false);
            
            if (result.success) {
                navigate('/dashboard');
            } else {
                setErrorMsg(result.error);
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <LogIn size={48} className="login-icon" />
                    <h2>Welcome Back</h2>
                    <p>Enter your credentials to access your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {errorMsg && <div className="error-message">{errorMsg}</div>}
                    
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
                        <button type="submit" className="action-btn primary" disabled={loading}>
                            {loading ? (
                                <>Logging in <Loader className="spin" size={20} /></>
                            ) : (
                                <>Sign In <ArrowRight size={20} /></>
                            )}
                        </button>
                    </div>
                </form>
                
                <div className="login-footer">
                    Don't have an account? 
                    <Link to="/register" className="login-link">Register here</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

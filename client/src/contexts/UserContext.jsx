import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        id: null,
        username: '',
        avatar: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('p2p-file-share-user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const registerUser = async (name, phone, email, password) => {
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, email, password }),
            });
            const data = await response.json();
            if (data.success) {
                const newUser = {
                    ...data.user,
                    avatar: data.user.username.charAt(0).toUpperCase()
                };
                setUser(newUser);
                localStorage.setItem('p2p-file-share-user', JSON.stringify(newUser));
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const loginUser = async (email, password) => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (data.success) {
                const loggedInUser = {
                    ...data.user,
                    avatar: data.user.username.charAt(0).toUpperCase()
                };
                setUser(loggedInUser);
                localStorage.setItem('p2p-file-share-user', JSON.stringify(loggedInUser));
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const resetPassword = async (email, currentPassword, newPassword) => {
        try {
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, currentPassword, newPassword }),
            });
            const data = await response.json();
            if (data.success) {
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Password reset failed:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const logout = () => {
        setUser({ id: null, username: '', avatar: '' });
        localStorage.removeItem('p2p-file-share-user');
    };

    return (
        <UserContext.Provider value={{ user, registerUser, loginUser, logout, resetPassword, loading }}>
            {!loading && children}
        </UserContext.Provider>
    );
};

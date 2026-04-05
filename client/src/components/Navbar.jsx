import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, User, Settings, Clock, MessageSquare } from 'lucide-react';
import { useConnection } from '../contexts/ConnectionContext';
import './Navbar.css';

const Navbar = () => {
    const { connectionStatus, connectedPeerId } = useConnection();
    const isConnected = connectionStatus === 'connected' && connectedPeerId;
    return (
        <nav className="navbar">
            <div className="nav-logo">
                <h2>FileShare</h2>
            </div>
            <div className="nav-links">
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to={isConnected ? `/room/${connectedPeerId}` : "/connect"} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <Users size={20} />
                    <span>{isConnected ? "Room" : "Connect"}</span>
                </NavLink>
                <NavLink to="/history" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <Clock size={20} />
                    <span>History</span>
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <User size={20} />
                    <span>Profile</span>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>
                <NavLink to="/support" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <MessageSquare size={20} />
                    <span>Support</span>
                </NavLink>
            </div>
        </nav>
    );
};

export default Navbar;

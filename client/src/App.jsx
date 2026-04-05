import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { UserProvider } from './contexts/UserContext';
import { SocketProvider } from './contexts/SocketContext';
import Navbar from './components/Navbar';

import { ConnectionProvider, useConnection } from './contexts/ConnectionContext';

const GlobalConnectionHandler = () => {
  const { connectionStatus, connectedPeerId } = useConnection();
  const navigate = useNavigate();
  const wasConnected = useRef(false);

  useEffect(() => {
    const isConnected = connectionStatus === 'connected';
    if (isConnected && !wasConnected.current && connectedPeerId) {
      navigate(`/room/${connectedPeerId}`);
    }
    wasConnected.current = isConnected;
  }, [connectionStatus, connectedPeerId, navigate]);

  return null;
};

// Pages
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Connect from './pages/Connect';
import Room from './pages/Room';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import History from './pages/History';
import SupportChat from './pages/SupportChat';
import NotFound from './pages/NotFound';

import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const location = useLocation();
  // Hide navbar on Authentication pages for a cleaner look
  const hideNavbar = ['/', '/register', '/login'].includes(location.pathname);

  return (
    <ThemeProvider>
      <UserProvider>
        <SocketProvider>
          <ConnectionProvider>
            <GlobalConnectionHandler />
            <div className="app-container">
              {!hideNavbar && <Navbar />}
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/connect" element={<Connect />} />
                  <Route path="/room/:roomId" element={<Room />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/support" element={<SupportChat />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </ConnectionProvider>
        </SocketProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;

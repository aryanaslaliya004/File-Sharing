import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useUser } from './UserContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const getSocketURL = () => {
    const { hostname } = window.location;
    return `http://${hostname}:3001`;
};

const SOCKET_URL = getSocketURL();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useUser();

    useEffect(() => {
        if (user && user.id) {
            const newSocket = io(SOCKET_URL);

            newSocket.on('connect', () => {
                console.log('Connected to signaling server');
                newSocket.emit('register', user.id);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

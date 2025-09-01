import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef();

  useEffect(() => {
    // Determine the server URL based on environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    const serverUrl = isDevelopment 
      ? 'http://localhost:5000' 
      : window.location.origin; // Use current domain in production

    console.log('Connecting to server:', serverUrl);

    // Create socket connection
    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      timeout: 20000, // 20 second timeout
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    socket.on('connect_error', (err) => {
      setError(err.message);
      console.error('Connection error:', err);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    error,
  };
};









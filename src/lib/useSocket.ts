import { useEffect, useRef } from 'react';

// Dynamically import socket.io-client to avoid SSR issues
let io: any = null;
if (typeof window !== 'undefined') {
  try {
    io = require('socket.io-client');
  } catch (error) {
    console.warn('Socket.IO client not available:', error);
  }
}

interface UseSocketOptions {
  enabled?: boolean;
  url?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { 
    enabled = true, 
    url = process.env.NEXT_PUBLIC_SOCKET_URL || "https://quiz-app-backend-pi.vercel.app",
    onConnect,
    onDisconnect,
    onError
  } = options;
  
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Early return if not enabled or io not available
    if (!enabled || !io) {
      console.log('Socket disabled or not available, skipping connection');
      return;
    }

    console.log('Attempting to connect to socket...');

    try {
      // Create socket connection
      const socket = io(url, {
        timeout: 5000,
        forceNew: true,
        transports: ['polling', 'websocket']
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket connected successfully');
        onConnect?.();
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        onDisconnect?.();
      });

      socket.on('connect_error', (error: any) => {
        console.error('Socket connection error:', error);
        onError?.(error);
      });

      return () => {
        if (socket.connected) {
          socket.disconnect();
        }
        socketRef.current = null;
      };
    } catch (error) {
      console.error('Error setting up socket connection:', error);
      onError?.(error);
    }
  }, [enabled, url, onConnect, onDisconnect, onError]);

  const emit = (event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  const disconnect = () => {
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
    }
  };

  return {
    socket: socketRef.current,
    emit,
    disconnect,
    isConnected: socketRef.current?.connected || false
  };
}; 
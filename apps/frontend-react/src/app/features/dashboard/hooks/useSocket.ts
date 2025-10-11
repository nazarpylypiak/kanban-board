import { useCallback, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseSocketOptions {
  reconnection?: boolean;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  reconnectionAttempts?: number;
  [key: string]: any;
}

interface UseSocketReturn<T = any> {
  socket: Socket<any, any> | null;
  emit: <K extends keyof T>(event: K, data: T[K]) => void;
  on: <K extends keyof T>(
    event: K,
    callback: (data: T[K]) => void
  ) => () => void;
  once: <K extends keyof T>(event: K, callback: (data: T[K]) => void) => void;
  isConnected: () => boolean;
  getSocketId: () => string | undefined;
}

/**
 * Custom hook for Socket.IO integration
 * @param url - The Socket.IO server URL
 * @param query - Query parameters (e.g., { userId })
 * @param options - Socket.IO client options
 * @returns Socket instance and utility functions
 */
export const useSocket = <T = any>(
  url: string,
  query?: Record<string, string | number> | null,
  options: UseSocketOptions = {}
): UseSocketReturn<T> => {
  const socketRef = useRef<Socket<any, any> | null>(null);
  const connectedRef = useRef<boolean>(false);

  // Initialize socket connection
  useEffect(() => {
    if (!query) return;
    socketRef.current = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      query,
      ...options
    });

    socketRef.current.on('connect', () => {
      connectedRef.current = true;
      console.log('Socket connected:', socketRef.current?.id);
    });

    socketRef.current.on('disconnect', () => {
      connectedRef.current = false;
      console.log('Socket disconnected');
    });

    socketRef.current.on('error', (error: Error) => {
      console.error('Socket error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [query, url, options]);

  // Emit an event
  const emit = useCallback(<K extends keyof T>(event: K, data: T[K]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event as string, data);
    } else {
      console.warn('Socket is not connected');
    }
  }, []);

  // Listen for an event
  const on = useCallback(
    <K extends keyof T>(
      event: K,
      callback: (data: T[K]) => void
    ): (() => void) => {
      if (socketRef.current) {
        socketRef.current.on(event as string, callback);
      }

      // Return unsubscribe function
      return () => {
        if (socketRef.current) {
          socketRef.current.off(event as string, callback);
        }
      };
    },
    []
  );

  // Listen for an event once
  const once = useCallback(
    <K extends keyof T>(event: K, callback: (data: T[K]) => void) => {
      if (socketRef.current) {
        socketRef.current.once(event as string, callback);
      }
    },
    []
  );

  // Get current connection status
  const isConnected = useCallback((): boolean => connectedRef.current, []);

  // Get socket ID
  const getSocketId = useCallback((): string | undefined => {
    return socketRef.current?.id;
  }, []);

  return {
    socket: socketRef.current,
    emit,
    on,
    once,
    isConnected,
    getSocketId
  };
};

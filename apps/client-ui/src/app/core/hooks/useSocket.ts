import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { io, Socket } from 'socket.io-client';
import { RootState } from '../store';

export const useSocket = () => {
  const { accessToken, loading } = useSelector(
    (state: RootState) => state.auth
  );
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (loading || !accessToken) return;

    const socketPort = import.meta.env.VITE_SOCKET_PORT || 3004;
    const socketPath = import.meta.env.VITE_SOCKET_PATH || '/socket.io';
    const socketHost = import.meta.env.VITE_SOCKET_HOST || 'http://localhost';

    const s = io(`${socketHost}:${socketPort}`, {
      path: socketPath,
      auth: { token: accessToken },
      transports: ['websocket']
    });

    const onConnect = () => {
      console.log('Socket connected:', s.id);
    };

    const onDisconnect = () => {
      console.log('Socket disconnected');
    };

    s.on('connect', onConnect);
    s.on('disconnected', onDisconnect);

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [accessToken, loading]);

  return socket;
};

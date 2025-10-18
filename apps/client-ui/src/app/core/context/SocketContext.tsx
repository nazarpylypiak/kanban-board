import { createContext, ReactNode, useContext } from 'react';
import { Socket } from 'socket.io-client';

interface SocketContextValue {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({ socket: null });

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({
  socket,
  children
}: {
  socket: Socket | null;
  children: ReactNode;
}) => (
  <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
);

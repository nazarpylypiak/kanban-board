import { io } from 'socket.io-client';

const port = import.meta.env.VITE_SOCKET_PORT || 3005;
const path = import.meta.env.VITE_SOCKET_PATH || '/socket.io';

export const socket = io('/', { path, port });

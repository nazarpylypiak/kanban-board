import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { socket } from '../../socket';

export const useInitializeSocket = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    function onConnect() {
      console.log('Socket connected:', socket.id);
    }

    function onDisconnect() {
      console.log('Socket disconnected');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [dispatch]);
};

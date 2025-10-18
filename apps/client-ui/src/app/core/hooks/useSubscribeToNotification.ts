import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Socket } from 'socket.io-client';
import { selectAuthUser } from '../store/auth/selectors/authSelectors';

interface Props {
  socket: Socket;
}

export const useSubscribeToNotification = ({ socket }: Props) => {
  const user = useSelector(selectAuthUser);

  useEffect(() => {
    if (!socket || !user) return;
    socket.emit('subscribe', { userId: user.id });

    return () => {
      socket.emit('unsubscribe', { userId: user.id });
    };
  }, [user, socket]);
};

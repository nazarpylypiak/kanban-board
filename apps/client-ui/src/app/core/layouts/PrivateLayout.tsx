import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { getProfile } from '../../features/dashboard/services/user.service';
import AppBar from '../../shared/containers/AppBar';
import { socket } from '../../socket';
import { RootState } from '../store';
import { setUser } from '../store/authSlice';

export default function PrivateLayout() {
  const dispatch = useDispatch();
  const { accessToken, loading } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (accessToken) {
      const fetchUser = async () => {
        try {
          const res = await getProfile();
          socket.emit('subscribe', { userId: res.data.id });

          dispatch(setUser(res.data));
        } catch (err) {
          console.error('Failed to load profile', err);
        }
      };
      fetchUser();
    }
  }, [accessToken, dispatch]);

  if (loading) return <div>Loading...</div>;
  if (!accessToken) return <Navigate to="/login" replace />;

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <AppBar />
      <Outlet />
    </div>
  );
}

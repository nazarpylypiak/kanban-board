import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { refreshToken } from '../../features/auth/services/auth.service';
import { AppDispatch } from '../store';
import { setAccessToken, setLoading } from '../store/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initialize = async () => {
      try {
        const res = await refreshToken();
        dispatch(setAccessToken(res.accessToken));
      } catch (err) {
        console.error('Faile to refresh token', err);
        dispatch(setAccessToken(null));
      } finally {
        dispatch(setLoading(false));
      }
    };

    initialize();
  }, [dispatch]);
};

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './core/store';
import { setAccessToken, setLoading } from './core/store/authSlice';
import { refreshToken } from './features/auth/services/auth.service';
import { AppRoutes } from './routes/AppRoutes';

export const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const didRefresh = useRef(false);

  useEffect(() => {
    if (didRefresh.current) return;
    didRefresh.current = true;
    const refresh = async () => {
      try {
        const res = await refreshToken();
        dispatch(setAccessToken(res.accessToken));
      } catch (err) {
        dispatch(setAccessToken(null));
      } finally {
        dispatch(setLoading(false));
      }
    };
    refresh();
  }, [dispatch]);

  return <AppRoutes />;
};

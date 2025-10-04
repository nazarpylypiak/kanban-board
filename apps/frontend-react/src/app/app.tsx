import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import PrivateLayout from './layouts/PrivateLayout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { refreshToken } from './services/auth.service';
import { AppDispatch } from './store';
import { setAccessToken, setLoading } from './store/authSlice';

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

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<PrivateLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
};

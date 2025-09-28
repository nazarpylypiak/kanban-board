import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store';
import { useEffect, useRef } from 'react';
import api from './services/api';
import { setAccessToken, setLoading } from './store/authSlice';
import PrivateLayout from './layouts/PrivateLayout';

export const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const didRefresh = useRef(false);

  useEffect(() => {
    if (didRefresh.current) return;
    didRefresh.current = true;
    const refresh = async () => {
      try {
        const res = await api.get<{ accessToken: string }>('/auth/refresh');
        dispatch(setAccessToken(res.data.accessToken));
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

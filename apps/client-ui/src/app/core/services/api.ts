import axios from 'axios';
import { refreshToken } from '../../features/auth/services/auth.service';

import { store } from '../store';
import { clearAuth, setAccessToken } from '../store/auth/authSlice';

export const createApi = (baseURL: string, listenerApi?: any) => {
  const dispatch = listenerApi?.dispatch || store.dispatch;
  const getState = listenerApi?.getState || store.getState;
  const instance = axios.create({
    baseURL,
    withCredentials: true
  });

  instance.interceptors.request.use((config) => {
    const token = getState().auth.accessToken;
    if (token && config.headers) {
      console.log(token);
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const data = await refreshToken();
          const newAccessToken = data.accessToken;

          dispatch(setAccessToken(newAccessToken));

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (err) {
          dispatch(clearAuth());
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

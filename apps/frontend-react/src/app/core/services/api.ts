import axios from 'axios';
import { store } from '../store';

export const createApi = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true
  });

  instance.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken;
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

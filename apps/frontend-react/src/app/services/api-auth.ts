import axios from 'axios';
import { store } from '../store';

const apiAuth = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

// Attach access token to headers
apiAuth.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default apiAuth;

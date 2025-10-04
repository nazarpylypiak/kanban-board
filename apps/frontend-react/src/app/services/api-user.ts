import axios from 'axios';
import { store } from '../store';

const apiUser = axios.create({
  baseURL: '/api/users',
  withCredentials: true,
});

// Attach access token to headers
apiUser.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default apiUser;

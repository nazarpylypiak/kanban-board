import api from './api';

export const register = async (
  email: string,
  password: string,
  role: 'user' | 'admin'
) => {
  const response = await api.post('/auth/register', {
    email,
    password,
    role,
  });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post<{ accessToken: string }>('/auth/login', {
    email,
    password,
  });
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post('/auth/refresh');
  return response.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
};

import apiAuth from './api-auth';

export const register = async (
  email: string,
  password: string,
  role: 'user' | 'admin'
) => {
  const response = await apiAuth.post('/auth/register', {
    email,
    password,
    role,
  });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await apiAuth.post<{ accessToken: string }>('/auth/login', {
    email,
    password,
  });
  return response.data;
};

export const refreshToken = async () => {
  const response = await apiAuth.post('/auth/refresh');
  return response.data;
};

export const logout = async () => {
  await apiAuth.post('/auth/logout');
};

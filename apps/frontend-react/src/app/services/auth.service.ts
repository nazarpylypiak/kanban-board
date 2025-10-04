import apiAuth from './api-auth';

export const register = async (
  email: string,
  password: string,
  role: 'user' | 'admin'
) => {
  const response = await apiAuth.post('/register', {
    email,
    password,
    role,
  });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await apiAuth.post<{ accessToken: string }>('/login', {
    email,
    password,
  });
  return response.data;
};

export const refreshToken = async () => {
  const response = await apiAuth.get('/refresh');
  return response.data;
};

export const logout = async () => {
  await apiAuth.post('/logout');
};

import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

export const register = async (
  email: string,
  password: string,
  role: 'user' | 'admin'
) => {
  const response = await axios.post(`${API_URL}/register`, {
    email,
    password,
    role,
  });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data; // { access_token }
};

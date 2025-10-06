import { createApi } from '../../core/services/api';

const apiUser = createApi('/api/users');

export const getProfile = async () => {
  const res = await apiUser.get('/profile');
  return res.data;
};

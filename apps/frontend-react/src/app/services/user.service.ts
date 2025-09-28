import apiUser from './api-user';

export const getProfile = async () => {
  const res = await apiUser.get('/users/profile');
  return res.data;
};

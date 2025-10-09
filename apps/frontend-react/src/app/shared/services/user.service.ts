import { IUser } from '@kanban-board/shared';
import { createApi } from '../../core/services/api';

const apiUser = createApi('/api/users');

export const getProfile = async () => {
  const res = await apiUser.get('/profile');
  return res.data;
};

export const getAllUsers = async () => {
  const res = await apiUser.get<IUser[]>('');
  return res.data;
};

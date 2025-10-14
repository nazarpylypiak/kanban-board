import { IUser } from '@kanban-board/shared';
import { createApi } from '../../core/services/api';

const apiUser = createApi('/api/users');

export const getProfile = () => {
  return apiUser.get('/profile');
};

export const getAllUsers = () => {
  return apiUser.get<IUser[]>('');
};

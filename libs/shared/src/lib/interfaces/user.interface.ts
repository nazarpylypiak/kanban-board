import { UserRole } from '../enums/user-role.enum';

export interface IUser {
  id: string;
  email?: string;
  role: UserRole;
}

export type JWTUser = Omit<IUser, 'id'> & { sub: string };

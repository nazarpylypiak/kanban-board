import { UserRole } from '../enums/user-role.enum';

export interface IUser {
  id: string;
  sub?: string;
  email?: string;
  role: UserRole;
}

export type JWTUser = Omit<IUser, 'id'> & { sub: string };

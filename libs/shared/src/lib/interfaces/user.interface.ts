import { UserRole } from '../enums/user-role.enum';

export interface IUser {
  id: string;
  sub?: string;
  email?: string;
  role: UserRole;
}

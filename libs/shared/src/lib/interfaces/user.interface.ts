import { UserRole } from '../enums/user-role.enum';

export interface User {
  sub: string;
  email?: string;
  roles: UserRole;
}

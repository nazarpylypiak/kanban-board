import { UserRole } from '../enums/user-role.enum';

export interface User {
  id: string;
  sub?: string;
  email?: string;
  role: UserRole;
}

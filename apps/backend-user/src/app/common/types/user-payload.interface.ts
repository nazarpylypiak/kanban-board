import { UserRole } from '../../user/entities/user.entity';

export interface UserPayload {
  sub: string;
  email?: string;
  roles: UserRole;
}

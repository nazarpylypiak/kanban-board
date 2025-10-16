import { UserRole } from '@kanban-board/shared';
import { Exclude, Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id!: string;

  @Expose()
  name: string;

  @Expose()
  email!: string;

  @Expose()
  role: UserRole;

  @Exclude()
  password?: string;

  @Exclude()
  createdAt?: Date;

  @Exclude()
  updatedAt?: Date;
}

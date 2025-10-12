import { IsEmail, IsString, IsOptional } from 'class-validator';
import { UserRole } from '@kanban-board/shared';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  role?: UserRole;
}

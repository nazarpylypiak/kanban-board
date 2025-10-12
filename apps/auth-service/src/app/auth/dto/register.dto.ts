import { IsEmail, IsString, MinLength } from 'class-validator';
import { UserRole } from '@kanban-board/shared';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  role: UserRole;
}

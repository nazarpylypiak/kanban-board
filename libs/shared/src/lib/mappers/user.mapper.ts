import { User, UserDto } from '@kanban-board/shared';
import { plainToInstance } from 'class-transformer';

export function mapUserToDto(user: User | User[]): UserDto {
  return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
}

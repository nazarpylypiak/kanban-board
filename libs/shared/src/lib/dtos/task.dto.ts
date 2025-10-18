import { Expose, Type } from 'class-transformer';
import { UserDto } from './user.dto';

export class TaskDto {
  @Expose() id!: string;
  @Expose() title!: string;
  @Expose() description?: string;
  @Expose() position!: number;
  @Expose() isDone!: boolean;
  @Expose() completedAt?: Date;
  @Expose() columnId!: string;
  @Expose() boardId!: string;

  @Expose() @Type(() => UserDto) owner!: UserDto;
  @Expose() ownerId!: string;

  @Expose() @Type(() => UserDto) assignees!: UserDto[];

  @Expose() assigneeIds!: string[];
  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;
}

import { Expose, Type } from 'class-transformer';
import { BoardDto } from './board.dto';
import { TaskDto } from './task.dto';

export class ColumnDto {
  @Expose() id!: string;
  @Expose() title!: string;
  @Expose() position!: number;
  @Expose() isDone!: boolean;
  @Expose() boardId!: string;

  @Expose() @Type(() => BoardDto) board?: BoardDto;

  @Expose() @Type(() => TaskDto) tasks?: TaskDto[];

  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;
}

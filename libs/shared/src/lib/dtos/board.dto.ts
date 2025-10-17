import { Expose, Type } from 'class-transformer';
import { ColumnDto } from './column.dto';
import { UserDto } from './user.dto';

export class BoardDto {
  @Expose() id!: string;
  @Expose() title!: string;
  @Expose() description?: string;

  @Expose() ownerId!: string;

  @Expose()
  @Type(() => UserDto)
  owner!: UserDto;

  @Expose()
  @Type(() => UserDto)
  sharedUsers!: UserDto[];

  @Expose() @Type(() => ColumnDto) columns?: ColumnDto[];

  @Expose() createdAt!: Date;
  @Expose() updatedAt!: Date;
}

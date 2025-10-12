import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator';
export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  boardId: string;

  @IsOptional()
  @IsBoolean()
  isDone?: boolean;
}

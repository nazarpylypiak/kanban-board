import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  boardId: string;
}

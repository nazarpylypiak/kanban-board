import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  sharedUserIds?: string[];
}

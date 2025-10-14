import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  assigneeIds?: string[];

  @IsOptional()
  @IsBoolean()
  isDone?: boolean;
}

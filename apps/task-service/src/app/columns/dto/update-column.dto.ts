import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateColumnDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isDone?: boolean;
}

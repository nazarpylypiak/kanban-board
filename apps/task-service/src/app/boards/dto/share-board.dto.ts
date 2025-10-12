import { IsUUID } from 'class-validator';

export class ShareBoardDto {
  @IsUUID('4', { each: true })
  userIds: string[];
}

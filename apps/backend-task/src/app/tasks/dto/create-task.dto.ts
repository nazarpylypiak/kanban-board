import { TaskStatus } from '@kanban-board/shared';

export class CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  columnId: string;
}

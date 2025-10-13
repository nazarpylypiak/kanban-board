import { ITask } from '@kanban-board/shared';

export type TCreateTask = Omit<
  ITask,
  | 'id'
  | 'columnId'
  | 'ownerId'
  | 'boardId'
  | 'position'
  | 'createdAt'
  | 'updatedAt'
> & {
  assigneeIds?: string[];
};

export type TUpdateTask = TCreateTask;

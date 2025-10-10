import { ITask } from '@kanban-board/shared';

export type TCreateTask = Omit<ITask, 'columnId' | 'position'> & {
  assigneeId?: string;
};

export type TUpdateTask = TCreateTask;

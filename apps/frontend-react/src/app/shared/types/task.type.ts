import { ITask } from '@kanban-board/shared';

export type TCreateTask = Omit<ITask, 'columnId' | 'position' | 'owner'> & {
  assigneeIds?: string[];
};

export type TUpdateTask = TCreateTask;

import { TaskStatus } from '../enums';
import { ITask } from '../interfaces';

type TaskStatusKey = NonNullable<ITask['status']>;

export const allowedTransitions: Record<TaskStatusKey, TaskStatusKey | null> = {
  [TaskStatus.TODO]: TaskStatus.IN_PROGRESS,
  [TaskStatus.IN_PROGRESS]: TaskStatus.DONE,
  [TaskStatus.DONE]: null, // no further moves
};

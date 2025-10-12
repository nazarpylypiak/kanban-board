import { IColumn, ITask } from '@kanban-board/shared';

export const taskKey = Symbol('task');
export type TaskData = {
  [taskKey]: true;
  task: ITask;
  columnId: string;
  rect: DOMRect;
};

export function getTaskData(task: ITask, column: IColumn, index: number) {
  return { [taskKey]: true, task, columnId: column.id, index };
}

export function isTaskData(
  data: Record<string | symbol, unknown>
): data is TaskData {
  return data[taskKey] === true;
}

const taskDropTargetKey = Symbol('task-drop-target');
export type TCardDropTargetData = {
  [taskDropTargetKey]: true;
  task: ITask;
  columnId: string;
  index: number;
};

export function isTaskDropTargetData(
  value: Record<string | symbol, unknown>
): value is TCardDropTargetData {
  return Boolean(value[taskDropTargetKey]);
}

export function getTaskDropTargetData({
  task,
  columnId,
  index
}: Omit<TCardDropTargetData, typeof taskDropTargetKey> & {
  columnId: string;
}): TCardDropTargetData {
  return {
    [taskDropTargetKey]: true,
    task,
    columnId,
    index
  };
}

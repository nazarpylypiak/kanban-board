import { IColumn, ITask } from '@kanban-board/shared';

export const taskKey = Symbol('task');
export type TaskData = {
  [taskKey]: true;
  task: ITask;
  columnId: string;
  rect: DOMRect;
};

export function getTaskData(task: ITask, column: IColumn) {
  return { [taskKey]: true, task, columnId: column.id };
}

export function isTaskData(
  data: Record<string | symbol, unknown>
): data is TaskData {
  return data[taskKey] === true;
}

const cardDropTargetKey = Symbol('task-drop-target');
export type TCardDropTargetData = {
  [cardDropTargetKey]: true;
  task: ITask;
  columnId: string;
};

export function isTaskDropTargetData(
  value: Record<string | symbol, unknown>
): value is TCardDropTargetData {
  return Boolean(value[cardDropTargetKey]);
}

export function getTaskDropTargetData({
  task,
  columnId
}: Omit<TCardDropTargetData, typeof cardDropTargetKey> & {
  columnId: string;
}): TCardDropTargetData {
  return {
    [cardDropTargetKey]: true,
    task,
    columnId
  };
}

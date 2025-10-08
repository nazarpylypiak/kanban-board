import { IColumn, ITask } from '@kanban-board/shared';
import { isTaskData } from '../task/task-data';

export const columnDataKey = Symbol('column');
export type ColumnData = { [columnDataKey]: true; column: IColumn };

export function getColumnData({
  column
}: Omit<ColumnData, typeof columnDataKey>): ColumnData {
  return { [columnDataKey]: true, column };
}
export function isColumnData(
  data: Record<string | symbol, unknown>
): data is ColumnData {
  return data[columnDataKey] === true;
}

export function isDraggingATask({
  source
}: {
  source: { data: Record<string | symbol, unknown> };
}): boolean {
  return isTaskData(source.data);
}

const taskDropTargetKey = Symbol('task-drop-target');
export type TCardDropTargetData = {
  [taskDropTargetKey]: true;
  task: ITask;
  columnId: string;
};

export function isTaskDropTargetData(
  value: Record<string | symbol, unknown>
): value is TCardDropTargetData {
  return Boolean(value[taskDropTargetKey]);
}

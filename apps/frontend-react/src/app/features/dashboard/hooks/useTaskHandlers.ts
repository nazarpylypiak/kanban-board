import { ITask } from '@kanban-board/shared';
import { useDispatch } from 'react-redux';
import {
  setTasks,
  udpateTask,
  updateTasksInColumn
} from '../../../core/store/tasksSlice';
import { moveTask } from '../../../shared/services/task.service';

export const useTaskHandlers = () => {
  const dispatch = useDispatch();

  const handleReorderInSameColumn = async (
    taskId: string,
    columnId: string,
    newIndex: number,
    tasks: ITask[]
  ) => {
    const prevTasks = [...tasks];
    dispatch(updateTasksInColumn(tasks.map((t, i) => ({ ...t, position: i }))));

    try {
      const res = await moveTask(taskId, columnId, newIndex);
      dispatch(udpateTask(res.data));
    } catch (e) {
      dispatch(setTasks(prevTasks));
    }
  };

  const handleMoveToColumn = async (
    taskId: string,
    destinationColumnId: string,
    newIndex: number,
    homeTasks: ITask[],
    destinationTasks: ITask[]
  ) => {
    const prevTasks = [...homeTasks, ...destinationTasks];
    dispatch(
      updateTasksInColumn([
        ...homeTasks.map((t, i) => ({ ...t, position: i })),
        ...destinationTasks.map((t, i) => ({ ...t, position: i }))
      ])
    );

    try {
      const res = await moveTask(taskId, destinationColumnId, newIndex);
      dispatch(udpateTask(res.data));
    } catch {
      dispatch(updateTasksInColumn(prevTasks));
    }
  };

  return { handleReorderInSameColumn, handleMoveToColumn };
};

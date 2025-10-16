import { ITask } from '@kanban-board/shared';
import { useDispatch } from 'react-redux';
import {
  setTasks,
  updateTask,
  updateTasksInColumn
} from '../../../../../core/store/tasks/tasksSlice';
import { moveTask } from '../../../services/task.service';

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
      dispatch(updateTask(res.data));
    } catch (e) {
      console.error('Fail to reorder a task', e);
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
      dispatch(updateTask(res.data));
    } catch (e) {
      console.error('Fail to move task', e);
      dispatch(updateTasksInColumn(prevTasks));
    }
  };

  return { handleReorderInSameColumn, handleMoveToColumn };
};

import { ITask } from '@kanban-board/shared';
import { useDispatch } from 'react-redux';
import {
  deleteTask,
  deleteTask as deleteTaskSlice,
  updateTask as updateTaskSlice
} from '../../../../../core/store/tasks';
import { TUpdateTask } from '../../../../../shared/types/task.type';
import { updateTask } from '../../../services/task.service';

interface Props {
  task: ITask;
  setShowConfirm: (a: boolean) => void;
}
export const useTaskHandlers = ({ task, setShowConfirm }: Props) => {
  const dispatch = useDispatch();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true); // open modal
  };

  const handleConfirmDelete = async () => {
    if (!task.id) return;
    try {
      await deleteTask(task.id);
      setShowConfirm(false);
      dispatch(deleteTaskSlice(task.id));
    } catch (e) {
      console.error('Failure to delete task', e);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  const handleComplete = async (completed: boolean) => {
    if (!task?.id) return;
    const updatdeTask: ITask = {
      ...task,
      isDone: completed
    };
    dispatch(updateTaskSlice(updatdeTask));
    try {
      await updateTask(task.id, { isDone: completed } as TUpdateTask);
    } catch (e) {
      dispatch(updateTaskSlice(task));
      console.error('Fail to update task', e);
    }
  };

  return {
    handleCancelDelete,
    handleConfirmDelete,
    handleDeleteClick,
    handleComplete
  };
};

import { ITask } from '@kanban-board/shared';
import { useDispatch } from 'react-redux';
import {
  deleteTask as deleteTaskSlice,
  updateTask as updateTaskSlice
} from '../../../../../core/store/tasks';
import {
  deleteTask,
  updateTask
} from '../../../../../shared/services/task.service';

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
    const newTask: ITask = {
      ...task,
      completedAt: completed ? new Date().toISOString() : null
    };
    dispatch(updateTaskSlice(newTask));
    try {
      await updateTask(task.id, newTask);
    } catch (e) {
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

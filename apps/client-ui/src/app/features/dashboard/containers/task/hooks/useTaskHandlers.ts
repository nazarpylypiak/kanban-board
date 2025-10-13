import { ITask } from '@kanban-board/shared';
import { useDispatch } from 'react-redux';
import { deleteTask as deleteTaskSlice } from '../../../../../core/store/tasks';
import { deleteTask } from '../../../../../shared/services/task.service';

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

  return { handleCancelDelete, handleConfirmDelete, handleDeleteClick };
};

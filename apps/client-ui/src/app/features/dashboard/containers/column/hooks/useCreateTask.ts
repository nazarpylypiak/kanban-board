import { useDispatch } from 'react-redux';
import { addTask } from '../../../../../core/store/tasks';
import { createTask } from '../../../../../shared/services/task.service';
import { TCreateTask } from '../../../../../shared/types/task.type';

export function useCreateTask() {
  const dispatch = useDispatch();

  const handleTaskCreate = async (columnId: string, task: TCreateTask) => {
    try {
      const res = await createTask(columnId, task);
      dispatch(addTask(res.data));
    } catch (e) {
      console.error('Failure to create task', e);
    }
  };

  return { handleTaskCreate };
}

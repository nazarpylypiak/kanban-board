import { IColumn } from '@kanban-board/shared';
import { useDispatch } from 'react-redux';
import { updateColumn as updateColumnSlice } from '../../../../../core/store/columnsSlice';
import { addTask } from '../../../../../core/store/tasks';
import { TCreateTask } from '../../../../../shared/types/task.type';
import { updateColumn } from '../../../services/columns.service';
import { createTask } from '../../../services/task.service';
import { TRules } from '../types/rules.type';

interface Props {
  column: IColumn;
}

export function useColumnHandlers({ column }: Props) {
  const dispatch = useDispatch();

  const handleTaskCreate = async (columnId: string, task: TCreateTask) => {
    try {
      const res = await createTask(columnId, task);
      dispatch(addTask(res.data));
    } catch (e) {
      console.error('Failure to create task', e);
    }
  };

  const handleRuleAdd = async (rules: TRules) => {
    const oldColumn = { ...column };
    const updatedColumn = { ...column, ...rules };
    dispatch(updateColumnSlice(updatedColumn));
    try {
      await updateColumn(column.id, updatedColumn);
    } catch (e) {
      console.error('Fail to update culomn', e);
      dispatch(updateColumnSlice(oldColumn));
    }
  };

  return { handleTaskCreate, handleRuleAdd };
}

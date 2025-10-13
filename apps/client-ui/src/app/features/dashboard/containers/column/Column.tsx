import { IColumn, IUser } from '@kanban-board/shared';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../core/store';
import { selectTasksByColumn } from '../../../../core/store/selectors/taskSelectors';
import AddNewTask from '../../components/AddNewTask';

import { updateColumn as updateColumnSlice } from '../../../../core/store/columnsSlice';
import { updateColumn } from '../../../../shared/services/columns.service';
import ColumnHeader from '../../components/column/ColumnHeader';
import TaskComponent from '../task/Task';
import { useColumnDnD, useCreateTask } from './hooks';
import { ColumnState, getColumnStateStyles } from './types/columnState';
import { TRules } from './types/rules.type';

interface ColumnProps {
  column: IColumn;
  isOwner: boolean;
  user: IUser | null;
}

const idle = { type: 'idle' } satisfies ColumnState;

export default function Column({ column, isOwner, user }: ColumnProps) {
  const [state, setState] = useState<ColumnState>(idle);
  const tasks = useSelector(selectTasksByColumn(column.id));
  const users = useSelector((state: RootState) => state.users.data);
  const dispatch = useDispatch();

  const { handleTaskCreate } = useCreateTask();
  const { ref, scrollableRef } = useColumnDnD({
    column,
    onStateChange: setState,
    idle
  });

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

  return (
    <div
      ref={ref}
      className={`${getColumnStateStyles(state.type)} w-64 bg-white rounded shadow p-4 flex flex-col h-full`}
    >
      <ColumnHeader
        title={column.name}
        isDone={column.isDone}
        onRuleAdded={handleRuleAdd}
      />

      <div
        ref={scrollableRef}
        className="overflow-y-auto flex flex-col gap-2 p-2 rounded transition-colors"
      >
        {tasks.map((task, i) => (
          <TaskComponent index={i} key={task.id} task={task} column={column} />
        ))}
      </div>

      {isOwner && (
        <div className="mt-2">
          <AddNewTask
            onCreateTask={(task) => handleTaskCreate(column.id, task)}
            users={users}
            currentUser={user}
          />
        </div>
      )}
    </div>
  );
}

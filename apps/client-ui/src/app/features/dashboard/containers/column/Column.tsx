import { IColumn, IUser } from '@kanban-board/shared';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../core/store';
import { selectTasksByColumn } from '../../../../core/store/selectors/taskSelectors';
import AddNewTask from '../../components/AddNewTask';

import ColumnHeader from '../../components/column/ColumnHeader';
import TaskComponent from '../task/Task';
import { useColumnDnD, useColumnHandlers } from './hooks';
import { ColumnState, getColumnStateStyles } from './types/columnState';

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

  const { handleTaskCreate, handleRuleAdd } = useColumnHandlers({ column });
  const { ref, scrollableRef } = useColumnDnD({
    column,
    onStateChange: setState,
    idle
  });

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

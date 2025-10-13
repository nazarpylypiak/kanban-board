import { IColumn, IUser } from '@kanban-board/shared';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../core/store';
import { selectTasksByColumn } from '../../../../core/store/selectors/taskSelectors';
import AddNewTask from '../../components/AddNewTask';

import { ColumnState, getColumnStateStyles } from '../../types/columnState';
import TaskComponent from '../task/Task';
import { useColumnDnD, useCreateTask } from './hooks';

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

  const { handleTaskCreate } = useCreateTask();
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
      <h2 className="font-bold mb-2">{column.name}</h2>

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

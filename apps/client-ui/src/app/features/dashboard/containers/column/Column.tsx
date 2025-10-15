import { IColumn, IUser } from '@kanban-board/shared';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectTasksByColumn } from '../../../../core/store/selectors/taskSelectors';
import AddNewTask from '../../components/AddNewTask';

import { RootState } from '../../../../core/store';
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
  const boardUsers = useSelector((state: RootState) => state.boards.boardUsers);

  const { handleTaskCreate, handleRuleAdd } = useColumnHandlers({
    column
  });
  const { ref, scrollableRef } = useColumnDnD({
    column,
    onStateChange: setState,
    idle
  });

  return (
    <div
      ref={ref}
      className={`flex flex-col w-72 bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 h-full transition-all hover:shadow-md ${getColumnStateStyles(state.type)}`}
    >
      <ColumnHeader
        title={column.name}
        isDone={column.isDone}
        onRuleAdded={handleRuleAdd}
      />

      <div
        ref={scrollableRef}
        className="flex-1 overflow-y-auto flex flex-col gap-3 p-2 rounded-md scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 transition-colors"
      >
        {tasks.length > 0 ? (
          tasks.map((task, i) => (
            <TaskComponent
              key={task.id}
              index={i}
              task={task}
              column={column}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 text-sm py-6 select-none">
            <span>No tasks</span>
          </div>
        )}
      </div>

      {isOwner && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <AddNewTask
            onCreateTask={(task) => handleTaskCreate(column.id, task)}
            users={boardUsers[column.boardId] ?? []}
            currentUser={user}
          />
        </div>
      )}
    </div>
  );
}

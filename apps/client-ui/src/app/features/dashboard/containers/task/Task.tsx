import { IColumn, ITask } from '@kanban-board/shared';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import Checkbox from '@mui/material/Checkbox';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../core/store';
import DragPreview from '../../components/task/DragPreview';
import { DropIndicator } from '../../components/task/DropIndicator';
import { ConfirmModal } from '../../modals/ConfirmModal';
import { useTaskDnD } from './hooks/useTaskDnD';
import { useTaskHandlers } from './hooks/useTaskHandlers';
import { TaskState } from './task-data';

interface TaskProps {
  column: IColumn;
  task: ITask;
  index: number;
}

const idle: TaskState = { type: 'idle' };

export default function Task({ task, column, index }: TaskProps) {
  const [state, setState] = useState<TaskState>(idle);
  const [showConfirm, setShowConfirm] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const isOwner = user?.id === task.ownerId;
  const [showActions, setShowActions] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const { ref } = useTaskDnD({
    column,
    task,
    index,
    onStateChange: setState,
    idle
  });

  const {
    handleCancelDelete,
    handleConfirmDelete,
    handleDeleteClick,
    handleComplete
  } = useTaskHandlers({ task, setShowConfirm });

  return (
    <>
      <div className="relative">
        <div
          ref={ref}
          onMouseEnter={() => {
            setShowActions(true);
            setShowCompleted(true);
          }}
          onMouseLeave={() => {
            setShowActions(false);
            setShowCompleted(false);
          }}
          className={`p-3 bg-gray-50 rounded shadow-sm hover:bg-gray-100 cursor-grab transition-colors duration-150 ${
            state.type === 'is-dragging' ? 'opacity-40' : ''
          }`}
        >
          <div className="flex justify-start items-center relative">
            <div className="w-6 h-6 mr-2 flex items-center justify-center">
              <div
                className={`transform transition-all duration-200 ease-in-out ${
                  showCompleted || task.completedAt
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-50'
                }`}
              >
                <Checkbox
                  onChange={(e) => handleComplete(e.target.checked)}
                  checked={!!task.completedAt}
                  icon={
                    <span className="w-5 h-5 border-2 border-gray-400 rounded-full block" />
                  }
                  checkedIcon={
                    <span className="w-5 h-5 bg-green-500 border-2 border-green-500 rounded-full flex items-center justify-center">
                      <CheckIcon className="text-white" fontSize="inherit" />
                    </span>
                  }
                />
              </div>
            </div>

            <div
              className={`font-semibold flex-1 ${
                task.completedAt ? 'line-through text-gray-400' : ''
              }`}
            >
              {task.title}
            </div>

            {isOwner && showActions && (
              <DeleteIcon
                onClick={handleDeleteClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ')
                    handleDeleteClick(e as any);
                }}
                role="button"
                tabIndex={0}
                aria-hidden={false}
                aria-label="Delete task"
                className="hover:text-gray-700 cursor-pointer absolute right-0"
              />
            )}

            {showConfirm && (
              <ConfirmModal
                message="Are you sure you want to delete this task?"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
              />
            )}
          </div>

          {task.description && (
            <div className="text-sm text-gray-500 line-clamp-4 mt-1">
              {task.description}
            </div>
          )}

          {task?.assignees?.length && (
            <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
              <span className="font-medium">Assigned to:</span>
              <span
                title={task.assignees.map((a) => a.email).join(', ')}
                className="truncate"
              >
                {task?.assignees.map((a) => a.email).join(', ')}
              </span>
            </div>
          )}
        </div>

        {state.type === 'is-dragging-over' && state.closestEdge ? (
          <DropIndicator edge={state.closestEdge} gap="8px" />
        ) : null}
      </div>

      {state.type === 'preview' && (
        <DragPreview task={task} container={state.container} />
      )}
    </>
  );
}

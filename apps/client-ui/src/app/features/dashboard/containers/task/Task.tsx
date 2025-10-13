import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { IColumn, ITask } from '@kanban-board/shared';
import { CSSProperties, HTMLAttributes, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTrash } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../core/store';
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
  const isOwner = user?.id === task.owner.id;

  const { ref } = useTaskDnD({
    column,
    task,
    index,
    onStateChange: setState,
    idle
  });

  const { handleCancelDelete, handleConfirmDelete, handleDeleteClick } =
    useTaskHandlers({ task, setShowConfirm });

  return (
    <>
      <div className="relative">
        {task.completedAt ?? 'not completed'}
        <div
          ref={ref}
          className={`${state.type === 'is-dragging' ? 'opacity-40' : ''} p-3 bg-gray-50 rounded shadow-sm hover:bg-gray-100 cursor-grab`}
        >
          <div className="flex justify-between">
            <div className="font-semibold">{task.title}</div>
            {isOwner && (
              <FaTrash
                onClick={handleDeleteClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ')
                    handleDeleteClick(e as any);
                }}
                className=" hover:text-gray-700 cursor-pointer"
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
            <div className="text-sm text-gray-500">{task.description}</div>
          )}

          {task?.assignees?.length && (
            <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
              <span className="font-medium">Assigned to:</span>
              <span
                title={task.assignees.map(({ email }) => email).join(', ')}
                className="truncate"
              >
                {task.assignees.map(({ email }) => email).join(', ')}
              </span>
            </div>
          )}
        </div>

        {state.type === 'is-dragging-over' && state.closestEdge ? (
          <DropIndicator edge={state.closestEdge} gap={'8px'} />
        ) : null}
      </div>

      {state.type === 'preview'
        ? createPortal(<DragPreview task={task} />, state.container)
        : ''}
    </>
  );
}

function DropIndicator({ edge, gap }: { edge: Edge; gap: string }) {
  const edgeStyles: Record<Edge, HTMLAttributes<HTMLElement>['className']> = {
    top: 'top-[--line-offset] before:top-[--offset-terminal]',
    right: 'right-[--line-offset] before:right-[--offset-terminal]',
    bottom: 'bottom-[--line-offset] before:bottom-[--offset-terminal]',
    left: 'left-[--line-offset] before:left-[--offset-terminal]'
  };
  const strokeSize = 2;
  const terminalSize = 8;
  const offsetToAlignTerminalWithLine = (strokeSize - terminalSize) / 2;
  const lineOffset = `calc(-0.5 * (${gap} + ${strokeSize}px))`;
  const orientationStype =
    'h-[--line-thickness] left-[--terminal-radius] right-0 before:left-[--negative-terminal-size]';

  return (
    <div
      style={
        {
          '--line-thickness': `${strokeSize}px`,
          '--line-offset': `${lineOffset}`,
          '--terminal-size': `${terminalSize}px`,
          '--terminal-radius': `${terminalSize / 2}px`,
          '--negative-terminal-size': `-${terminalSize}px`,
          '--offset-terminal': `${offsetToAlignTerminalWithLine}px`
        } as CSSProperties
      }
      className={`absolute z-10 bg-blue-700 pointer-events-none before:content-[''] before:w-[--terminal-size] before:h-[--terminal-size] box-border before:absolute before:border-[length:--line-thickness] before:border-solid before:border-blue-700 before:rounded-full ${orientationStype} ${edgeStyles[edge]}`}
    ></div>
  );
}

function DragPreview({ task }: { task: ITask }) {
  return (
    <div className=" min-w-52 h-12 border-solid rounded p-2 bg-white">
      {task.title}
    </div>
  );
}

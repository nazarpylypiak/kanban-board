import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
  ElementDropTargetEventBasePayload
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { IColumn, ITask } from '@kanban-board/shared';
import {
  CSSProperties,
  HTMLAttributes,
  useEffect,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';
import { FaTrash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../core/store';
import { deleteTask as deleteTaskSlice } from '../../../../core/store/tasks/tasksSlice';
import { getIsDropIndicatorHidden } from '../../../../shared/helpres';
import { deleteTask } from '../../../../shared/services/task.service';
import { ConfirmModal } from '../../modals/ConfirmModal';
import { getTaskData, getTaskDropTargetData, isTaskData } from './task-data';

type TaskState =
  | { type: 'idle' }
  | { type: 'preview'; container: HTMLElement }
  | { type: 'is-dragging' }
  | { type: 'is-dragging-over'; closestEdge: Edge | null };

interface TaskProps {
  task: ITask;
  col: IColumn;
  index: number;
}

const idle: TaskState = { type: 'idle' };

export default function Task({ task, col, index }: TaskProps) {
  const [state, setState] = useState<TaskState>(idle);
  const [showConfirm, setShowConfirm] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const ref = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const isOwner = user?.id === task.owner.id;

  useEffect(() => {
    const element = ref.current;

    const onChange = ({ source, self }: ElementDropTargetEventBasePayload) => {
      const closestEdge = extractClosestEdge(self.data);
      const sourceIndex = source.data.index as number;

      const isDropIndicatorHidden = getIsDropIndicatorHidden(
        index,
        sourceIndex,
        closestEdge
      );
      if (isDropIndicatorHidden) {
        setState({ type: 'is-dragging-over', closestEdge: null });
        return;
      }
      setState((current) => {
        if (
          current.type === 'is-dragging-over' &&
          current.closestEdge === closestEdge
        ) {
          return current;
        }
        return {
          type: 'is-dragging-over',
          closestEdge
        };
      });
    };

    if (element) {
      return combine(
        draggable({
          element,
          getInitialData: () => getTaskData(task, col, index),
          onGenerateDragPreview: ({ nativeSetDragImage }) => {
            setCustomNativeDragPreview({
              nativeSetDragImage,
              getOffset: pointerOutsideOfPreview({
                x: '16px',
                y: '8px'
              }),
              render({ container }) {
                setState({ type: 'preview', container });
              }
            });
          },
          onDragStart: () => setState({ type: 'is-dragging' }),
          onDrop: () => setState(idle)
        }),
        dropTargetForElements({
          element,
          getIsSticky: () => true,
          canDrop: ({ source }) => {
            if (source.element === element) return false;

            return isTaskData(source.data);
          },
          getData: ({ input }) => {
            const data = getTaskDropTargetData({
              task,
              columnId: col.id,
              index
            });
            return attachClosestEdge(data, {
              element,
              input,
              allowedEdges: ['top', 'bottom']
            });
          },
          onDragEnter: onChange,
          onDrag: onChange,
          onDragLeave: () => {
            setState(idle);
          },
          onDrop() {
            setState(idle);
          }
        })
      );
    }
  }, [task, col]);

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

  return (
    <>
      <div className="relative">
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

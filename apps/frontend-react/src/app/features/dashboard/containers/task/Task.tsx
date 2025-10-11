import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements
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
import { getTaskData, getTaskDropTargetData, isTaskData } from './task-data';

type TaskState =
  | { type: 'idle' }
  | { type: 'preview'; container: HTMLElement }
  | { type: 'is-dragging' }
  | { type: 'is-dragging-over'; closestEdge: Edge | null };

interface TaskProps {
  task: ITask;
  col: IColumn;
}

const idle: TaskState = { type: 'idle' };

export default function Task({ task, col }: TaskProps) {
  const [state, setState] = useState<TaskState>(idle);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;

    if (element) {
      return combine(
        draggable({
          element,
          getInitialData: () => getTaskData(task, col),
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
            const data = getTaskDropTargetData({ task, columnId: col.id });
            return attachClosestEdge(data, {
              element,
              input,
              allowedEdges: ['top', 'bottom']
            });
          },
          onDragEnter: ({ self }) => {
            const closestEdge = extractClosestEdge(self.data);
            setState({ type: 'is-dragging-over', closestEdge });
          },
          onDrag: ({ self }) => {
            const closestEdge = extractClosestEdge(self.data);

            setState((current) => {
              if (
                current.type === 'is-dragging-over' &&
                current.closestEdge === closestEdge
              ) {
                return current;
              }
              return { type: 'is-dragging-over', closestEdge };
            });
          },
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

  return (
    <>
      <div className="relative">
        <div
          ref={ref}
          className={`${state.type === 'is-dragging' ? 'opacity-40' : ''} p-3 bg-gray-50 rounded shadow-sm hover:bg-gray-100 cursor-grab`}
        >
          <div className="font-semibold">{task.title}</div>

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

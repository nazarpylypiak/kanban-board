import {
  attachClosestEdge,
  extractClosestEdge
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
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { getIsDropIndicatorHidden } from '../../../../../shared/helpres';
import {
  getTaskData,
  getTaskDropTargetData,
  isTaskData,
  TaskState
} from '../task-data';

interface Props {
  column: IColumn;
  task: ITask;
  index: number;
  onStateChange: Dispatch<SetStateAction<TaskState>>;
  idle: TaskState;
}

export const useTaskDnD = ({
  column,
  task,
  index,
  onStateChange,
  idle
}: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
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
        onStateChange({ type: 'is-dragging-over', closestEdge: null });
        return;
      }
      onStateChange((current) => {
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
          getInitialData: () => getTaskData(task, column, index),
          onGenerateDragPreview: ({ nativeSetDragImage }) => {
            setCustomNativeDragPreview({
              nativeSetDragImage,
              getOffset: pointerOutsideOfPreview({
                x: '16px',
                y: '8px'
              }),
              render({ container }) {
                onStateChange({ type: 'preview', container });
              }
            });
          },
          onDragStart: () => onStateChange({ type: 'is-dragging' }),
          onDrop: () => onStateChange(idle)
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
              columnId: column.id,
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
            onStateChange(idle);
          },
          onDrop() {
            onStateChange(idle);
          }
        })
      );
    }
  }, [column, task, index, onStateChange, idle]);

  return { ref };
};

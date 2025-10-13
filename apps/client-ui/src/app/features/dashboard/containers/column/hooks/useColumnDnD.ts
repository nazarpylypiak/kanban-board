import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { IColumn } from '@kanban-board/shared';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { isShallowEqual } from '../../../../../shared/utils/shalowEqual';
import {
  getColumnData,
  isDraggingATask
} from '../../../containers/column/column-data';
import {
  isTaskData,
  isTaskDropTargetData,
  TaskData
} from '../../../containers/task/task-data';
import { ColumnState } from '../types/columnState';

interface Props {
  column: IColumn;
  onStateChange: Dispatch<SetStateAction<ColumnState>>;
  idle: ColumnState;
}

export const useColumnDnD = ({ column, onStateChange, idle }: Props) => {
  const ref = useRef(null);
  const scrollableRef = useRef<HTMLDivElement | null>(null);

  function setIsTaskOver({
    data,
    location
  }: {
    data: TaskData;
    location: DragLocationHistory;
  }) {
    const innerMost = location.current.dropTargets[0];
    const isOverChildCard = Boolean(
      innerMost && isTaskDropTargetData(innerMost.data)
    );

    const proposed: ColumnState = {
      type: 'is-task-over',
      dragging: data.rect,
      isOverChildCard
    };

    onStateChange((current) =>
      isShallowEqual(proposed, current) ? current : proposed
    );
  }
  useEffect(() => {
    const element = ref.current;
    const scrollable = scrollableRef.current;

    if (element && scrollable) {
      return combine(
        dropTargetForElements({
          element,
          getData: () => getColumnData({ column }),
          canDrop({ source }) {
            return isDraggingATask({ source });
          },
          getIsSticky: () => true,
          onDragStart({ source, location }) {
            if (isTaskData(source.data)) {
              setIsTaskOver({ data: source.data, location });
            }
          },
          onDragEnter({ source, location }) {
            if (isTaskData(source.data)) {
              setIsTaskOver({ data: source.data, location });
            }
          },
          onDragLeave: () => onStateChange(idle),
          onDrop: () => onStateChange(idle)
        }),
        autoScrollForElements({
          canScroll({ source }) {
            // if (!settings.isOverElementAutoScrollEnabled) {
            //   return false;
            // }

            return isDraggingATask({ source });
          },
          getConfiguration: () => ({
            maxScrollSpeed: 'standard'
          }),
          element: scrollable
        })
      );
    }
  }, []);

  return { ref, scrollableRef };
};

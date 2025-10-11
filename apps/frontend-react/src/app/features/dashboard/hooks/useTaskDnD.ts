import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { IColumn } from '@kanban-board/shared';
import { useEffect } from 'react';
import { store } from '../../../core/store';
import { makeSelectTasksByColumn } from '../../../core/store/selectors/taskSelectors';
import { getIsDropIndicatorHidden } from '../../../shared/helpres';
import { isColumnData } from '../containers/column/column-data';
import { isTaskData, isTaskDropTargetData } from '../containers/task/task-data';
import { useTaskHandlers } from './useTaskHandlers';

export const useTaskDnD = (columns: IColumn[]) => {
  const { handleReorderInSameColumn, handleMoveToColumn } = useTaskHandlers();

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isTaskData(source.data);
      },
      onDrop({ source, location }) {
        const dragging = source.data;
        if (!isTaskData(dragging) || !dragging?.task?.id) return;

        const target = location.current.dropTargets[0];
        if (!target) return;

        const dropTargetData = target.data;
        const taskId = dragging.task.id;

        const homeColumnIndex = columns.findIndex(
          (column) => column.id === dragging.task.columnId
        );
        const home: IColumn | undefined = columns[homeColumnIndex];
        if (!home) return;

        const selectHomeTasks = makeSelectTasksByColumn(home.id);
        const homeTasks = selectHomeTasks(store.getState());
        const taskIndexInHome =
          homeTasks?.findIndex(({ id }) => id === taskId) ?? -1;

        if (taskIndexInHome === -1) return;

        // dropping on a task
        if (isTaskDropTargetData(dropTargetData)) {
          const destinationColumnIndex = columns.findIndex(
            ({ id }) => id === dropTargetData.columnId
          );
          const destination = columns[destinationColumnIndex];
          const selectDestinationTasks = makeSelectTasksByColumn(
            destination.id
          );
          const destinationTasks = selectDestinationTasks(store.getState());
          // reordering in home column
          if (home === destination) {
            const taskFinishIndex = destinationTasks?.findIndex(
              (task) => task.id === dropTargetData.task.id
            );
            // could not find tasks needed
            if (taskFinishIndex === -1) return;
            // no need change
            if (taskIndexInHome === taskFinishIndex) return;

            const closestEdge = extractClosestEdge(dropTargetData);

            const isDropIndicatorHidden = getIsDropIndicatorHidden(
              dropTargetData.index,
              source.data.index as number,
              closestEdge
            );

            if (isDropIndicatorHidden) return;

            const reordered = reorderWithEdge({
              axis: 'vertical',
              list: homeTasks,
              startIndex: taskIndexInHome,
              indexOfTarget: taskFinishIndex,
              closestEdgeOfTarget: closestEdge
            });

            handleReorderInSameColumn(
              dragging.task.id,
              home.id,
              taskFinishIndex,
              reordered
            );

            return;
          }

          if (!destination) return;

          const indexOfTarget = destinationTasks.findIndex(
            (task) => task.id === dropTargetData.task.id
          );
          const closestEdge = extractClosestEdge(dropTargetData);
          const isDropIndicatorHidden = getIsDropIndicatorHidden(
            dropTargetData.index,
            source.data.index as number,
            closestEdge
          );

          if (isDropIndicatorHidden) return;
          const finalIndex =
            closestEdge === 'bottom' ? indexOfTarget + 1 : indexOfTarget;

          // remove card from home list
          const newHomeTasks = Array.from(homeTasks);
          newHomeTasks.splice(taskIndexInHome, 1);

          // insert into destination list
          const newDestinationTasks = Array.from(destinationTasks);
          const movedTask = { ...dragging.task, columnId: destination.id };
          newDestinationTasks.splice(finalIndex, 0, movedTask);

          handleMoveToColumn(
            dragging.task.id,
            destination.id,
            finalIndex,
            newHomeTasks,
            newDestinationTasks
          );
          return;
        }

        if (isColumnData(dropTargetData)) {
          const destinationColumnIndex = columns.findIndex(
            (column) => column.id === dropTargetData.column.id
          );
          const destination = columns[destinationColumnIndex];
          if (!destination) return;
          const selectDestinationTasks = makeSelectTasksByColumn(
            destination.id
          );
          const destinationTasks = selectDestinationTasks(store.getState());

          // dropping on home
          if (home === destination) {
            const finishIndex = homeTasks.length - 1;
            const reordered = reorder({
              list: homeTasks,
              startIndex: taskIndexInHome,
              finishIndex
            });

            handleReorderInSameColumn(
              dragging.task.id,
              home.id,
              finishIndex,
              reordered
            );
            return;
          }

          const newHomeTasks = Array.from(homeTasks);
          newHomeTasks.splice(taskIndexInHome, 1);

          // insert into destination list
          const newDestinationTasks = Array.from(destinationTasks);

          const finalIndex = destinationTasks.length;
          const movedTask = { ...dragging.task, columnId: destination.id };
          newDestinationTasks.splice(finalIndex, 0, movedTask);

          handleMoveToColumn(
            dragging.task.id,
            destination.id,
            finalIndex,
            newHomeTasks,
            newDestinationTasks
          );
        }
      }
    });
  }, [columns, handleReorderInSameColumn, handleMoveToColumn]);
};

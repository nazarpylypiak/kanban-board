import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { IBoard, IColumn } from '@kanban-board/shared';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, store } from '../../../core/store';
import { addColumn, setColumns } from '../../../core/store/columnsSlice';
import { makeSelectTasksByColumn } from '../../../core/store/selectors/taskSelectors';
import {
  reorderTaskInColumn,
  setTasks,
  udpateTask
} from '../../../core/store/tasksSlice';
import { create, getAll } from '../../../shared/services/columns.service';
import { moveTask } from '../../../shared/services/task.service';
import AddNewColumn from '../components/AddNewColumn';
import Column from './column/Column';
import { isColumnData } from './column/column-data';
import { isTaskData, isTaskDropTargetData } from './task/task-data';

interface BoardProps {
  board: IBoard;
}

export default function Board({ board }: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const columns = useSelector((state: RootState) => state.columns.data);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!board.id) return;
    getAll(board.id).then((res) => {
      const allTasks = res.data.flatMap((col) =>
        (col.tasks || []).map((task) => ({ ...task, columnId: col.id }))
      );
      dispatch(setColumns(res.data));
      dispatch(setTasks(allTasks));
    });
  }, [board.id, dispatch]);

  const columnAdded = async (name: string) => {
    create(board.id, name).then((res) => {
      dispatch(addColumn({ ...res.data, boardId: board.id }));

      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollLeft = containerRef.current.scrollWidth;
        }
      }, 0);
    });
  };
  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isTaskData(source.data);
      },
      onDrop({ source, location }) {
        const dragging = source.data;

        if (!isTaskData(dragging)) return;

        const innerMost = location.current.dropTargets[0];

        if (!innerMost) {
          return;
        }
        const dropTargetData = innerMost.data;
        const homeColumnIndex = columns.findIndex(
          (column) => column.id === dragging.task.columnId
        );
        const home: IColumn | undefined = columns[homeColumnIndex];

        if (!home) return;
        const selectTasks = makeSelectTasksByColumn(home.id);
        const homeTasks = selectTasks(store.getState());
        const taskIndexInHome =
          homeTasks?.findIndex(({ id }) => id === dragging.task.id) ?? -1;

        if (isTaskDropTargetData(dropTargetData)) {
          const destinationColumnIndex = columns.findIndex(
            ({ id }) => id === dropTargetData.columnId
          );
          const destination = columns[destinationColumnIndex];

          // reordering in home column
          if (home === destination) {
            const taskFinishIndex =
              homeTasks?.findIndex(
                (task) => task.id === dropTargetData.task.id
              ) ?? -1;

            if (taskIndexInHome === -1 || taskFinishIndex === -1) return;
            if (taskIndexInHome === taskFinishIndex) return;
            if (!dragging?.task.id) return;

            const prevTasks = [...homeTasks];

            dispatch(
              reorderTaskInColumn({
                taskId: dragging.task.id,
                columnId: destination.id,
                newIndex: taskFinishIndex
              })
            );
            moveTask(dragging.task.id, destination.id, taskFinishIndex)
              .then((res) => {
                dispatch(udpateTask(res.data));
              })
              .catch(() => {
                dispatch(setTasks(prevTasks));
              });
          }

          // move task from one column to another
          if (!destination) return;
          const selectDestinationTasks = makeSelectTasksByColumn(
            destination.id
          );
          const destinationTasks = selectDestinationTasks(store.getState());
          const indexOfTarget =
            destinationTasks?.findIndex(
              (task) => task.id === dropTargetData.task.id
            ) ?? -1;
          console.log(indexOfTarget);
          //  const indexOfTarget = destination.cards.findIndex(
          //     (card) => card.id === dropTargetData.card.id,
          //   );

          //   const closestEdge = extractClosestEdge(dropTargetData);
          //   const finalIndex = closestEdge === 'bottom' ? indexOfTarget + 1 : indexOfTarget;

          //   // remove card from home list
          //   const homeCards = Array.from(home.cards);
          //   homeCards.splice(cardIndexInHome, 1);

          //   // insert into destination list
          //   const destinationCards = Array.from(destination.cards);
          //   destinationCards.splice(finalIndex, 0, dragging.card);

          //   const columns = Array.from(data.columns);
          //   columns[homeColumnIndex] = {
          //     ...home,
          //     cards: homeCards,
          //   };
          //   columns[destinationColumnIndex] = {
          //     ...destination,
          //     cards: destinationCards,
          //   };
          //   setData({ ...data, columns });
          //   return;
        }

        if (isColumnData(dropTargetData)) {
          console.log('column', dropTargetData);
        }
      }
    });
  }, [columns]);
  return (
    <main ref={containerRef} className="flex gap-4 p-4 overflow-x-auto flex-1">
      <div className="flex gap-4 items-start">
        {columns.length > 0 &&
          columns.map((col: IColumn) => <Column key={col.id} col={col} />)}

        <AddNewColumn onAddColumn={(name) => columnAdded(name)} />
      </div>
    </main>
  );
}

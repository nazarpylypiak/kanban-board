import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { IBoard, IColumn, ITask } from '@kanban-board/shared';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, store } from '../../../core/store';
import { addColumn, setColumns } from '../../../core/store/columnsSlice';
import { makeSelectTasksByColumn } from '../../../core/store/selectors/taskSelectors';
import {
  addTask,
  moveTaskToColumn,
  reorderTaskInColumn,
  setTasks,
  udpateTask
} from '../../../core/store/tasksSlice';
import { create, getAll } from '../../../shared/services/columns.service';
import { moveTask } from '../../../shared/services/task.service';
import AddNewColumn from '../components/AddNewColumn';
import { useSocket } from '../hooks/useSocket';
import Column from './column/Column';
import { isColumnData } from './column/column-data';
import { isTaskData, isTaskDropTargetData } from './task/task-data';

interface BoardProps {
  board: IBoard;
}

interface TaskEvents {
  taskCreated: ITask;
}

export default function Board({ board }: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const columns = useSelector((state: RootState) => state.columns.data);
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const isOwner = user?.id === board.owner.id;
  const { on } = useSocket<TaskEvents>(
    'http://localhost:3003/tasks',
    user ? { userId: user.id, boardId: board.id } : null
  );

  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => {
      const unsubscribe = on('taskCreated', (task) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Task created:', task);
        }
        dispatch(addTask(task));
      });

      return unsubscribe;
    }, 100);

    return () => clearTimeout(timer);
  }, [on, dispatch, user]);

  useEffect(() => {
    if (!board.id) return;

    const loadBoardData = async () => {
      try {
        const res = await getAll(board.id);
        const allTasks = res.data.flatMap((col) =>
          (col.tasks || []).map((task) => ({ ...task, columnId: col.id }))
        );
        dispatch(setColumns(res.data));
        dispatch(setTasks(allTasks));
      } catch (e) {
        console.error('Failed to load board data:', e);
      }
    };

    loadBoardData();
  }, [board.id, dispatch]);

  const handleColumnAdded = useCallback(
    async (name: string) => {
      try {
        const res = await create(board.id, name);
        dispatch(addColumn({ ...res.data, boardId: board.id }));

        // Auto-scroll to the new column
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollLeft = containerRef.current.scrollWidth;
          }
        }, 0);
      } catch (e) {
        console.error('Failed to create column:', e);
      }
    },
    [board.id, dispatch]
  );

  const handleReorderInSameColumn = useCallback(
    async (
      taskId: string,
      columnId: string,
      newIndex: number,
      tasks: ITask[]
    ) => {
      const prevTasks = [...tasks];
      dispatch(reorderTaskInColumn({ taskId, columnId, newIndex }));

      try {
        const res = await moveTask(taskId, columnId, newIndex);
        dispatch(udpateTask(res.data));
      } catch (e) {
        console.error('Failed to reorder task:', e);
        dispatch(setTasks(prevTasks));
      }
    },
    [dispatch]
  );

  const handleMoveToColumn = useCallback(
    async (
      taskId: string,
      sourceColumnId: string,
      destinationColumnId: string,
      newIndex: number,
      tasks: ITask[]
    ) => {
      const prevTasks = [...tasks];
      dispatch(
        moveTaskToColumn({
          taskId,
          sourceColumnId,
          destinationColumnId,
          newIndex
        })
      );

      try {
        const res = await moveTask(taskId, destinationColumnId, newIndex);
        dispatch(udpateTask(res.data));
      } catch (e) {
        console.log('Failed to move task: ', e);
        dispatch(setTasks(prevTasks));
      }
    },
    [dispatch]
  );

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

        if (isTaskDropTargetData(dropTargetData)) {
          const destinationColumnIndex = columns.findIndex(
            ({ id }) => id === dropTargetData.columnId
          );
          const destination = columns[destinationColumnIndex];
          if (!destination) return;

          const selectDestinationTasks = makeSelectTasksByColumn(
            destination.id
          );
          const destinationTasks = selectDestinationTasks(store.getState());

          let taskFinishIndex =
            destinationTasks?.findIndex(
              (task) => task.id === dropTargetData.task.id
            ) ?? -1;

          if (taskFinishIndex === -1) return;
          const indexOffsetByEdge =
            extractClosestEdge(dropTargetData) === 'bottom' ? 1 : 0;
          // reordering in home column
          if (home === destination) {
            if (taskIndexInHome === taskFinishIndex) return;
            handleReorderInSameColumn(
              taskId,
              destination.id,
              taskFinishIndex + indexOffsetByEdge,
              homeTasks
            );
          } else {
            handleMoveToColumn(
              taskId,
              home.id,
              destination.id,
              taskFinishIndex + indexOffsetByEdge,
              destinationTasks
            );
          }
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
          const newIndex = destinationTasks.length;

          // Same column move to end
          if (home === destination) {
            if (homeTasks.length === 1) return;
            handleReorderInSameColumn(
              taskId,
              destination.id,
              newIndex,
              homeTasks
            );
          } else {
            handleMoveToColumn(
              taskId,
              home.id,
              destination.id,
              newIndex,
              destinationTasks
            );
          }
        }
      }
    });
  }, [columns, handleReorderInSameColumn, handleMoveToColumn]);

  return (
    <main
      ref={containerRef}
      className="flex gap-4 pt-4 pr-4 pb-4 overflow-x-auto flex-1  h-screen"
    >
      <div className="flex gap-4 items-start">
        {columns.length > 0 &&
          columns.map((col: IColumn) => (
            <Column key={col.id} col={col} isOwner={isOwner} user={user} />
          ))}

        {isOwner && (
          <AddNewColumn onAddColumn={(name) => handleColumnAdded(name)} />
        )}
      </div>
    </main>
  );
}

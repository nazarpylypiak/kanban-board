import {
  IColumn,
  IColumnNotificationWrapper,
  INotificationUser,
  ITask,
  ITaskNotificationWrapper
} from '@kanban-board/shared';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSocketContext } from '../../../../../core/context/SocketContext';
import {
  addColumn,
  deleteColumn
} from '../../../../../core/store/columns/columnsSlice';
import {
  addTask,
  deleteTask,
  moveTaskToOtherColumn,
  reorderTaskInSameColumn
} from '../../../../../core/store/tasks/tasksSlice';

export const useColumnNotifications = () => {
  const dispatch = useDispatch();
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    const handleColumnNotification = (
      notification: INotificationUser<
        IColumnNotificationWrapper | ITaskNotificationWrapper
      >
    ) => {
      const { type, payload } = notification;
      if ('column' in payload || 'columnId' in payload) {
        switch (type) {
          case 'COLUMN_ADDED':
            if (!payload?.column?.id) return;
            dispatch(addColumn(payload.column as IColumn));
            break;
          case 'COLUMN_DELETED':
            if (!payload?.columnId) return;
            dispatch(deleteColumn(payload.columnId));
            break;
          default:
        }
      } else if ('task' in payload || 'taskId' in payload) {
        const handleTaskMoved = ({
          task,
          homeColumnId
        }: {
          task: ITask;
          homeColumnId: string;
        }) => {
          if (!task?.id) return;
          const columnId = task.columnId;

          if (homeColumnId !== columnId) {
            dispatch(
              moveTaskToOtherColumn({
                task: task,
                homeColumnId: homeColumnId,
                destinationColumnId: columnId,
                position: task.position
              })
            );
          } else {
            // reorder in same column
            dispatch(
              reorderTaskInSameColumn({
                taskId: task.id,
                newPosition: task.position,
                destinationColumnId: columnId
              })
            );
          }
        };

        switch (type) {
          case 'TASK_CREATED':
            dispatch(addTask(payload.task as ITask));
            break;
          case 'TASK_DELETED':
            if (!payload.taskId) return;
            dispatch(deleteTask(payload.taskId));
            break;
          case 'TASK_MOVED': {
            if (
              !payload.homeColumnId ||
              typeof payload.homeColumnId !== 'string'
            )
              return;
            handleTaskMoved({
              task: payload.task as ITask,
              homeColumnId: payload.homeColumnId
            });
            break;
          }

          default:
        }
      }
    };

    socket.on('notification', handleColumnNotification);

    return () => {
      socket.off('notification', handleColumnNotification);
    };
  }, [dispatch]);
};

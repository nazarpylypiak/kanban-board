import {
  ITask,
  IUser,
  IUserNotificationEvent,
  TBoardEventType,
  TTaskEventType
} from '@kanban-board/shared';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  addTask,
  deleteTask,
  moveTaskToOtherColumn,
  reorderTaskInSameColumn,
  updateTask
} from '../../../../../core/store/tasks/tasksSlice';
import { socket } from '../../../../../socket';

export function useTaskEvents(user: IUser | null) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;

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

    const handleNotification = (notification: IUserNotificationEvent) => {
      if (notification.eventType.includes('task.')) {
        const task = notification.payload.task as ITask;
        switch (notification.eventType as TTaskEventType) {
          case 'task.created':
            dispatch(addTask(task));
            break;
          case 'task.updated':
            if (!task.id) return;
            dispatch(updateTask(task));
            break;
          case 'task.deleted':
            if (!task.id) return;
            dispatch(deleteTask(task.id));
            break;
          case 'task.moved':
            if (
              !notification.payload.homeColumnId ||
              typeof notification.payload.homeColumnId !== 'string'
            )
              return;
            handleTaskMoved({
              task,
              homeColumnId: notification.payload.homeColumnId
            });

            break;
          default:
        }
      } else if (notification.eventType.includes('board.')) {
        console.log(notification);
        switch (notification.eventType as TBoardEventType) {
          case 'board.shared':
            console.log('Board shared');
            break;
          case 'board.unshared':
            console.log('Board unshared');
            break;
          default:
        }
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [user, dispatch]);
}

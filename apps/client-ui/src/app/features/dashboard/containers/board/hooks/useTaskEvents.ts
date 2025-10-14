import { ITask, ITaskUserEventPayload, IUser } from '@kanban-board/shared';
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
            taskId: task.id,
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

    const handleNotification = (notification: ITaskUserEventPayload) => {
      switch (notification.eventType) {
        case 'task.created':
          dispatch(addTask(notification.task));
          break;
        case 'task.updated':
          if (!notification.task.id) return;
          dispatch(updateTask(notification.task));
          break;
        case 'task.deleted':
          if (!notification.task.id) return;
          dispatch(deleteTask(notification.task.id));
          break;
        case 'task.moved':
          if (!notification.homeColumnId) return;
          handleTaskMoved({
            task: notification.task,
            homeColumnId: notification.homeColumnId
          });

          break;
        default:
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [user, dispatch]);
}

import { INotification, ITask, IUser } from '@kanban-board/shared';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  moveTaskToOtherColumn,
  reorderTaskInSameColumn
} from '../../../../../core/store/tasks/tasksSlice';
import { socket } from '../../../../../socket';

export function useTaskEvents(user: IUser | null) {
  const dispatchRef = useRef(useDispatch());
  const userRef = useRef(user);

  useEffect(() => {
    if (!userRef.current) return;

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

    const handleNotification = (notification: INotification) => {
      console.log(notification);
      const eventType = notification.eventType.toLocaleLowerCase();

      // const task = notification.payload.task as ITask;
      // switch (notification.eventType as TTaskEventType) {
      //   case 'task.created':
      //     dispatch(addTask(task));
      //     break;
      //   case 'task.updated':
      //     if (!task.id) return;
      //     dispatch(updateTask(task));
      //     break;
      //   case 'task.deleted':
      //     if (!task.id) return;
      //     dispatch(deleteTask(task.id));
      //     break;
      //   case 'task.moved':
      //     if (
      //       !notification.payload.homeColumnId ||
      //       typeof notification.payload.homeColumnId !== 'string'
      //     )
      //       return;
      //     handleTaskMoved({
      //       task,
      //       homeColumnId: notification.payload.homeColumnId
      //     });
      //     break;
      //   default:
      // }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [user]);
}

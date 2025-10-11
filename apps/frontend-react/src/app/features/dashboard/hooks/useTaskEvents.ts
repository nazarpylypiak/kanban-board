import { ITask, IUser } from '@kanban-board/shared';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  addTask,
  deleteTask,
  updateTask
} from '../../../core/store/tasksSlice';
import { socket } from '../../../socket';

export function useTaskEvents(user: IUser | null) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('joinUser', { userId: user.id });

    const handleTaskCreated = (task: ITask) => {
      console.log('Task created', task.id);
      dispatch(addTask(task));
    };

    const handleTaskUpdated = (task: ITask) => {
      console.log('Task updated', task.id);
      dispatch(updateTask(task));
    };

    const handleTaskDeleted = ({ taskId }: { taskId: string }) => {
      console.log('Task deleted', taskId);
      dispatch(deleteTask(taskId));
    };

    socket.on('taskCreated', handleTaskCreated);
    socket.on('taskUpdated', handleTaskUpdated);
    socket.on('taskDeleted', handleTaskDeleted);

    return () => {
      socket.off('taskCreated', handleTaskCreated);
      socket.off('taskUpdated', handleTaskUpdated);
      socket.off('taskDeleted', handleTaskDeleted);
      socket.emit('leaveUser', { userId: user.id }, () => {
        socket.disconnect();
      });
    };
  }, [user, dispatch]);
}

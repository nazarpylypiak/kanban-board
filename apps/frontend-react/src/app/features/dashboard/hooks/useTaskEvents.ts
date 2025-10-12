import { ITask, IUser } from '@kanban-board/shared';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import {
  addTask,
  deleteTask,
  moveTaskToOtherColumn,
  reorderTaskInSameColumn,
  updateTask
} from '../../../core/store/tasks/tasksSlice';
import { socket } from '../../../socket';

export function useTaskEvents(user: IUser | null) {
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.data);

  useEffect(() => {
    if (!user) return;
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('joinTasks', { userId: user.id });

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

    const handleTaskMoved = ({
      task,
      homeColumnId
    }: {
      task: ITask;
      homeColumnId: string;
    }) => {
      if (!task?.id) return;
      const columnId = task.columnId;
      console.log('Task moved');

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

    socket.on('taskCreated', handleTaskCreated);
    socket.on('taskUpdated', handleTaskUpdated);
    socket.on('taskDeleted', handleTaskDeleted);
    socket.on('taskMoved', handleTaskMoved);

    return () => {
      socket.off('taskCreated', handleTaskCreated);
      socket.off('taskUpdated', handleTaskUpdated);
      socket.off('taskDeleted', handleTaskDeleted);
      socket.off('taskMoved', handleTaskMoved);
      socket.emit('leaveTasks', { userId: user.id }, () => {
        socket.disconnect();
      });
    };
  }, [user, dispatch]);
}

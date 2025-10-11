import { ITask } from '@kanban-board/shared';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addTask, deleteTask } from '../../../core/store/tasksSlice';
import { useSocket } from '../hooks/useSocket';

interface TaskEvents {
  taskCreated: ITask;
  taskDeleted: { taskId: string };
  taskMoved: { taskId: string; columnId: string; position?: number };
}

export const useTaskSocket = (boardId: string, userId: string) => {
  const dispatch = useDispatch();
  const { on } = useSocket<TaskEvents>('http://localhost:3003/tasks', {
    userId,
    boardId
  });

  useEffect(() => {
    const unsubCreate = on('taskCreated', (task) => dispatch(addTask(task)));
    const unsubDelete = on('taskDeleted', ({ taskId }) =>
      dispatch(deleteTask(taskId))
    );

    const unsubMove = on('taskMoved', ({ taskId, columnId, position }) => {
      console.log('Moved:', { taskId, columnId, position });
    });

    return () => {
      unsubCreate();
      unsubDelete();
      unsubMove();
    };
  }, [on, dispatch]);
};

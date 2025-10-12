import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addColumn, setColumns } from '../../../core/store/columnsSlice';
import { setTasks } from '../../../core/store/tasks/tasksSlice';
import { create, getAll } from '../../../shared/services/columns.service';

export const useBoardData = (boardId: string) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!boardId) return;

    const loadBoardData = async () => {
      const res = await getAll(boardId);
      const allTasks = res.data.flatMap((col) =>
        (col.tasks || []).map((task) => ({ ...task, columnId: col.id }))
      );
      dispatch(setColumns(res.data));
      dispatch(setTasks(allTasks));
    };

    loadBoardData();
  }, [boardId, dispatch]);

  const handleAddColumn = useCallback(
    async (name: string) => {
      const res = await create(boardId, name);
      dispatch(addColumn({ ...res.data, boardId }));

      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollLeft = containerRef.current.scrollWidth;
        }
      }, 0);
    },
    [boardId, dispatch]
  );

  return { containerRef, handleAddColumn };
};

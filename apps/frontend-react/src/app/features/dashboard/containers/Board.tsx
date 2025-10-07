import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { IBoard, IColumn, ITask } from '@kanban-board/shared';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import { addColumn, setColumns } from '../../../core/store/columnsSlice';
import { setTasks, udpateTask } from '../../../core/store/tasksSlice';
import { create, getAll } from '../../../shared/services/columns.service';
import { moveTask } from '../../../shared/services/task.service';
import AddNewColumn from '../components/AddNewColumn';
import Column from './Column';

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
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0];

        if (!destination) return;
        const destinationColId = (destination.data.col as IColumn).id;
        const sourceLocationColId = (source.data.col as IColumn).id;

        if (destinationColId === sourceLocationColId) return;
        const task = source.data.task as ITask;

        if (!task.id || !destinationColId) return;
        moveTask(task.id, destinationColId).then((res) =>
          dispatch(udpateTask(res.data))
        );
      }
    });
  }, []);
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

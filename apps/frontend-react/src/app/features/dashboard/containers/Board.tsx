import { IBoard, IColumn } from '@kanban-board/shared';
import { useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import AddNewColumn from '../components/AddNewColumn';
import { useBoardData } from '../hooks/useBoardData';
import { useTaskDnD } from '../hooks/useTaskDnD';
import { useTaskSocket } from '../hooks/useTaskSocket';
import Column from './column/Column';

interface BoardProps {
  board: IBoard;
}

export default function Board({ board }: BoardProps) {
  const columns = useSelector((state: RootState) => state.columns.data);
  const user = useSelector((state: RootState) => state.auth.user);
  const { containerRef, handleAddColumn } = useBoardData(board.id);
  const isOwner = user?.id === board.owner.id;

  if (board.id && user?.id) {
    useTaskSocket(board.id, user.id);
  }
  useTaskDnD(columns);

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
          <AddNewColumn onAddColumn={(name) => handleAddColumn(name)} />
        )}
      </div>
    </main>
  );
}

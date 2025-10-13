import { IBoard, IColumn } from '@kanban-board/shared';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../core/store';
import AddNewColumn from '../../components/AddNewColumn';
import Column from '../column/Column';
import { useBoardData, useMonitorDnD, useTaskEvents } from './hooks';

interface BoardProps {
  board: IBoard;
}

export default function Board({ board }: BoardProps) {
  const columns = useSelector((state: RootState) => state.columns.data);
  const user = useSelector((state: RootState) => state.auth.user);
  const { containerRef, handleAddColumn } = useBoardData(board.id);
  const isOwner = user?.id === board.owner.id;

  useTaskEvents(user);
  useMonitorDnD(columns);

  return (
    <main
      ref={containerRef}
      className="flex gap-4 pt-4 pr-4 pb-4 overflow-x-auto flex-1  h-screen"
    >
      <div className="flex gap-4 items-start">
        {columns.length > 0 &&
          columns.map((c: IColumn) => (
            <Column key={c.id} column={c} isOwner={isOwner} user={user} />
          ))}

        {isOwner && (
          <AddNewColumn onAddColumn={(name) => handleAddColumn(name)} />
        )}
      </div>
    </main>
  );
}

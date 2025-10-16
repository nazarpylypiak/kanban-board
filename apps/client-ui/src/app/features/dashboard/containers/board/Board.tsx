import { IBoard, IColumn } from '@kanban-board/shared';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../core/store';
import AddNewColumn from '../../components/AddNewColumn';
import Column from '../column/Column';
import { useBoardData, useBoardUsers, useMonitorDnD } from './hooks';

interface BoardProps {
  board: IBoard;
  isOwner: boolean;
}

export default function Board({ board, isOwner }: BoardProps) {
  const columns = useSelector((state: RootState) => state.columns.data);
  const user = useSelector((state: RootState) => state.auth.user);
  const { containerRef, handleAddColumn } = useBoardData(board.id);

  useBoardUsers({ boardId: board.id });

  // useTaskEvents(user);
  useMonitorDnD(columns);

  return (
    <>
      <main
        ref={containerRef}
        className="flex gap-6 p-4 overflow-x-auto overflow-y-hidden flex-1 bg-gray-50"
      >
        <div className="flex gap-6 items-start">
          {columns.length > 0 &&
            columns.map((c: IColumn) => (
              <Column key={c.id} column={c} isOwner={isOwner} user={user} />
            ))}

          {isOwner && (
            <AddNewColumn onAddColumn={(name) => handleAddColumn(name)} />
          )}
        </div>
      </main>
    </>
  );
}

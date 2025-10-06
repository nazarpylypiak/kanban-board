import { IBoard } from '@kanban-board/shared';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getAll } from '../services/boards.service';
import { RootState } from '../store';

interface BoardSelectorProps {
  onSelectBoard: (board: IBoard) => void;
}

export default function BoardSelector({ onSelectBoard }: BoardSelectorProps) {
  const [boards, setBoards] = useState<IBoard[]>([]);
  const [newBoardName, setNewBoardName] = useState('');
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!user) return;
    getAll(user.id).then((res) => setBoards(res.data));
  }, [user?.id]);

  const createBoard = async () => {};

  return (
    <div className="board-selector p-4 w-full bg-white shadow rounded">
      <h3 className="text-lg font-semibold mb-4">Your Boards</h3>

      <ul className="space-y-2 mb-4">
        {boards.map((board) => (
          <li key={board.id}>
            <button
              onClick={() => onSelectBoard(board)}
              className="w-full text-left px-3 py-2 rounded hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {board.name}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          placeholder="New board name"
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={createBoard}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Create
        </button>
      </div>
    </div>
  );
}

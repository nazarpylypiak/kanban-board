import { IBoard } from '@kanban-board/shared';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import { addBoard, setBoards } from '../../../core/store/boardsSlice';
import { create, getAll } from '../../../shared/services/boards.service';

interface BoardSelectorProps {
  onSelectBoard: (board: IBoard) => void;
}

export default function BoardSelector({ onSelectBoard }: BoardSelectorProps) {
  const [newBoardName, setNewBoardName] = useState('');
  const user = useSelector((state: RootState) => state.auth.user);
  const boards = useSelector((state: RootState) => state.boards.data);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;
    getAll(user.id).then((res) => dispatch(setBoards(res.data)));
  }, [user?.id]);

  const createBoard = async () => {
    if (!newBoardName || !user) return;
    const newBoard = await create({ name: newBoardName });
    dispatch(addBoard(newBoard));
    setNewBoardName('');
  };
  const onEditBoard = async (board: IBoard) => {};
  const onDeleteBoard = async (boardId: string) => {};

  return (
    <div className="board-selector p-4 w-full bg-white shadow rounded">
      <h3 className="text-lg font-semibold mb-4">Your Boards</h3>

      <ul className="space-y-2 mb-4">
        {boards.map((board) => (
          <li
            key={board.id}
            className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 hover:bg-gray-100"
          >
            <span
              onClick={() => onSelectBoard(board)}
              className="flex-1 cursor-pointer font-medium hover:underline"
            >
              {board.name}
            </span>

            {false && board.owner?.id === user?.id && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditBoard(board)}
                  className="px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteBoard(board.id)}
                  className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            )}
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
          disabled={!newBoardName}
          onClick={createBoard}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-300 disabled:cursor-not-allowed
    disabled:text-gray-500"
        >
          Create
        </button>
      </div>
    </div>
  );
}

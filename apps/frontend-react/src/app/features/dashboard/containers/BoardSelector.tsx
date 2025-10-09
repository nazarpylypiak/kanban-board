import { IBoard } from '@kanban-board/shared';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import { addBoard, setBoards } from '../../../core/store/boardsSlice';
import { setUsers } from '../../../core/store/usersSlice';
import { create, getAll } from '../../../shared/services/boards.service';
import { getAllUsers } from '../../../shared/services/user.service';
import ShareBoardModal from '../modals/ShareBoardModal';

interface BoardSelectorProps {
  onSelectBoard: (board: IBoard) => void;
}

export default function BoardSelector({ onSelectBoard }: BoardSelectorProps) {
  const [newBoardName, setNewBoardName] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);
  const [sharePopupOpen, setSharePopupOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<IBoard | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const boards = useSelector((state: RootState) => state.boards.data);
  const users = useSelector((state: RootState) => state.users.data);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;
    const loadBoards = async () => {
      try {
        const res = await getAll(user.id);
        dispatch(setBoards(res.data));
        if (res.data[0]) {
          setSelectedBoard(res.data[0]);
          onSelectBoard(res.data[0]);
        }
      } catch (e) {
        console.error('Failed to load boards');
      }
    };
    loadBoards();
  }, [user?.id, dispatch]);

  const createBoard = async () => {
    if (!newBoardName || !user) return;
    const newBoard = await create({ name: newBoardName });
    dispatch(addBoard(newBoard));
    setNewBoardName('');
    setSelectedBoard(newBoard);
    onSelectBoard(newBoard);
  };

  const handleSelectBoard = (board: IBoard) => {
    setSelectedBoard(board);
    onSelectBoard(board);
    setPopupOpen(false);
  };

  useEffect(() => {
    const loadAllUsers = async () => {
      try {
        const res = await getAllUsers();
        dispatch(setUsers(res));
      } catch (e) {
        console.error('Failed to load users');
      }
    };
    loadAllUsers();
  }, [dispatch]);

  const handleShareBoard = (boardId: string, userIds: string[]) => {};

  return (
    <div className="board-selector p-4 w-full bg-white shadow rounded relative">
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
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
        >
          Create
        </button>

        <button
          onClick={() => setPopupOpen(!popupOpen)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          {selectedBoard ? selectedBoard.name : 'Select Board'}
        </button>
      </div>

      {popupOpen && (
        <div className="absolute top-full mt-2 left-0 w-full bg-white border rounded shadow-lg z-50 max-h-60 overflow-y-auto">
          {boards.map((board) => (
            <div
              key={board.id}
              className="flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-blue-100"
            >
              <span
                className="flex-1 h-full"
                onClick={() => handleSelectBoard(board)}
              >
                {board.name} {board.owner?.id === user?.id ? '(Owner)' : ''}
              </span>
              {board.owner?.id === user?.id && (
                <button
                  onClick={() => setSharePopupOpen(!sharePopupOpen)}
                  className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Share
                </button>
              )}
              {sharePopupOpen && (
                <ShareBoardModal
                  board={board}
                  users={users}
                  onShare={(boardId, userIds) =>
                    handleShareBoard(boardId, userIds)
                  }
                  onClose={() => setSharePopupOpen(false)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

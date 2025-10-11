import { IBoard, IUser } from '@kanban-board/shared';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import { setSelectedBoard, updateBoard } from '../../../core/store/boardsSlice';
import { share } from '../../../shared/services/boards.service';
import ShareBoardModal from '../modals/ShareBoardModal';

interface Props {
  user: IUser | null;
}

export default function BoardDropdown({ user }: Props) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [sharePopupOpen, setSharePopupOpen] = useState(false);
  const boards = useSelector((state: RootState) => state.boards.data);
  const users = useSelector((state: RootState) => state.users.data);
  const currentBoard = useSelector(
    (state: RootState) => state.boards.selectedBoard
  );
  const dispatch = useDispatch();
  const filteredUsers = useMemo(
    () => users.filter(({ id }) => id !== user?.id),
    [user?.id, users]
  );

  const handleBoardSelect = (board: IBoard) => {
    setPopupOpen(false);
    dispatch(setSelectedBoard(board));
  };

  const handleShareBoard = async (boardId: string, userIds: string[]) => {
    try {
      const res = await share(boardId, userIds);
      dispatch(updateBoard(res.data));
    } catch (e) {
      console.error('Sharing error: ', e);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupOpen(false);
        setSharePopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popupOpen]);

  return (
    <>
      <button
        onClick={() => setPopupOpen(!popupOpen)}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        {currentBoard ? currentBoard.name : 'Select Board'}
      </button>

      {popupOpen && (
        <div
          ref={popupRef}
          className="absolute top-full mt-2 left-0 w-full bg-white border rounded shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {boards.map((board) => (
            <div
              key={board.id}
              className="flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-blue-100"
            >
              <span
                className="flex-1 h-full"
                onClick={() => handleBoardSelect(board)}
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
                  users={filteredUsers}
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
    </>
  );
}

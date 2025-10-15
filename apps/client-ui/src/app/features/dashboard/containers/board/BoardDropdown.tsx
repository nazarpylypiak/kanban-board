import { IBoard, IUser } from '@kanban-board/shared';
import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../core/store';
import {
  setSelectedBoard,
  updateBoard
} from '../../../../core/store/boards/boardsSlice';
import { shareBoard } from '../../../../shared/services/boards.service';
import ShareBoardModal from '../../modals/ShareBoardModal';

interface Props {
  user: IUser | null;
}

export default function BoardDropdown({ user }: Props) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [sharePopupId, setSharePopupId] = useState<string | null>(null);
  const boards = useSelector((state: RootState) => state.boards.data);
  const users = useSelector((state: RootState) => state.users.data);
  const isAdmin = user?.role === 'admin';
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
      const res = await shareBoard(boardId, userIds);
      dispatch(updateBoard(res.data));
    } catch (e) {
      console.error('Sharing error: ', e);
    }
  };

  const handleShareButton = (e: MouseEvent, boardId: string) => {
    e.stopPropagation();
    setSharePopupId(boardId);
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
                {board.name}
                <span className="flex-1 text-sm text-gray-700">
                  {board.sharedUsers?.length
                    ? board.sharedUsers.map(({ id, email }) => (
                        <span
                          key={id}
                          className="mr-1 px-1.5 py-0.5 text-xs bg-gray-200 rounded-full"
                        >
                          {email}
                        </span>
                      ))
                    : '—'}
                </span>
              </span>
              {board.ownerId === user?.id && (
                <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-white bg-blue-500 rounded-full">
                  Owner
                </span>
              )}
              {(board.ownerId === user?.id || isAdmin) && (
                <button
                  onClick={(e) => handleShareButton(e, board.id)}
                  className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Share
                </button>
              )}
              {sharePopupId === board.id && (
                <ShareBoardModal
                  board={board}
                  users={filteredUsers}
                  onShare={(boardId, userIds) =>
                    handleShareBoard(boardId, userIds)
                  }
                  onClose={() => setSharePopupId(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

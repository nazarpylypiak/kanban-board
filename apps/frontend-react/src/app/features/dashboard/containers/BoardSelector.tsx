import { IBoard } from '@kanban-board/shared';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import { addBoard, setBoards } from '../../../core/store/boardsSlice';
import { setUsers } from '../../../core/store/usersSlice';
import { create, getMyBoards } from '../../../shared/services/boards.service';
import { getAllUsers } from '../../../shared/services/user.service';
import AddNewBoard from '../components/AddNewBoard';
import BoardDropdown from './BoardDropdown';

interface BoardSelectorProps {
  currentBoard: IBoard | null;
  onSelectCurrentBoard: (board: IBoard | null) => void;
}

export default function BoardSelector({
  onSelectCurrentBoard,
  currentBoard
}: BoardSelectorProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;
    const loadBoards = async () => {
      try {
        const res = await getMyBoards();
        dispatch(setBoards(res.data));
        if (res.data[0]) {
          onSelectCurrentBoard(res.data[0]);
        }
      } catch (e) {
        console.error('Failed to load boards');
      }
    };
    loadBoards();
  }, [user?.id, dispatch]);

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

  // useEffect(() => {
  //   if (!user?.id) return;

  //   const socket = io('http://localhost:3003/boards', {
  //     transports: ['websocket'],
  //     query: { userId: user.id }
  //   });
  //   socket.on('board-shared', (board) => {
  //     dispatch(addBoard(board));
  //     if (!currentBoard) onSelectCurrentBoard(board);
  //   });
  //   socket.on('board-removed', ({ boardId }) => {
  //     dispatch(deleteBoard(boardId));
  //     if (currentBoard?.id === boardId) onSelectCurrentBoard(null);
  //   });
  //   return () => {
  //     socket.disconnect();
  //   };
  // }, [user?.id, dispatch, currentBoard]);

  const handleCreateBoard = useCallback(
    async (name: string) => {
      const newBoard = await create({ name });
      dispatch(addBoard(newBoard));
      onSelectCurrentBoard(newBoard);
    },
    [onSelectCurrentBoard, dispatch]
  );

  return (
    <div className="board-selector p-4 w-full bg-white shadow rounded relative">
      <div className="flex gap-2">
        <AddNewBoard onBoardCreate={(name) => handleCreateBoard(name)} />

        <BoardDropdown
          currentBoard={currentBoard}
          user={user}
          onSelectCurrentBoard={onSelectCurrentBoard}
        />
      </div>
    </div>
  );
}

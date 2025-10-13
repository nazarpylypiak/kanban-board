import { IBoard, IUser } from '@kanban-board/shared';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  addBoard,
  deleteBoard
} from '../../../../../core/store/boards/boardsSlice';
import { socket } from '../../../../../socket';

export function useBoardEvents(user: IUser | null) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;

    socket.emit('joinBoards', { userId: user.id });

    const handleBoardShared = (board: IBoard) => {
      console.log('Board shared');
      dispatch(addBoard(board));
    };
    const handleBoardUnshared = ({ boardId }: { boardId: string }) => {
      console.log('Board unshared', boardId);
      dispatch(deleteBoard(boardId));
    };

    socket.on('boardShared', handleBoardShared);
    socket.on('boardUnshared', handleBoardUnshared);

    return () => {
      socket.off('boardShared', handleBoardShared);
      socket.off('boardUnshared', handleBoardUnshared);
      socket.emit('leaveBoards', { userId: user.id });
    };
  }, [user, dispatch]);
}

import { IBoardNotification } from '@kanban-board/shared';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addBoard, deleteBoard } from '../../../core/store/boards/boardsSlice';
import { socket } from '../../../socket';
import { getOne } from '../services/boards.service';

export const useBoardNotification = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleBoardShared = async (boardId: string) => {
      try {
        const board = await getOne(boardId);
        dispatch(addBoard(board.data));
      } catch (e) {
        console.error(`Failed to fetch shared board ${boardId}`, e);
      }
    };

    const handleBoardNotification = (notification: IBoardNotification) => {
      console.log(notification);
      const { type, payload } = notification;

      switch (type) {
        case 'BOARD_SHARED':
          if (!payload?.board?.id) return;
          handleBoardShared(payload.board.id);
          break;
        case 'BOARD_DELETED':
          if (!payload?.boardId) return;
          dispatch(deleteBoard(payload.boardId));
          break;
        default:
      }
    };

    socket.on('notification', handleBoardNotification);

    return () => {
      socket.off('notification', handleBoardNotification);
    };
  }, [dispatch]);
};

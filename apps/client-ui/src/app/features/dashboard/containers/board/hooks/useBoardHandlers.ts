import { useDispatch } from 'react-redux';
import {
  deleteBoard as deleteBoardSlice,
  updateBoard
} from '../../../../../core/store/boards/boardsSlice';
import {
  deleteBoard,
  shareBoard
} from '../../../../../shared/services/boards.service';

export default function useBoardHandlers() {
  const dispatch = useDispatch();

  const handleDeleteBoard = async (boardId: string) => {
    try {
      await deleteBoard(boardId);
      dispatch(deleteBoardSlice(boardId));
    } catch (e) {
      console.error('Failed to delet board', e);
    }
  };

  const handleShareBoard = async (boardId: string, userIds: string[]) => {
    try {
      const res = await shareBoard(boardId, userIds);
      dispatch(updateBoard(res.data));
    } catch (e) {
      console.error('Sharing error: ', e);
    }
  };
  return { handleDeleteBoard, handleShareBoard };
}

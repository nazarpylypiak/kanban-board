import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setBoardUsers } from '../../../../../core/store/boards/boardsSlice';
import { getBoardUsers } from '../../../../../shared/services/boards.service';

interface Props {
  boardId: string;
}

export const useBoardUsers = ({ boardId }: Props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!boardId) return;

    const fetchBoardUsers = async () => {
      try {
        const res = await getBoardUsers(boardId);
        dispatch(setBoardUsers({ boardId, users: res.data }));
      } catch (e) {
        console.error('Failed to read board users', e);
      }
    };
    fetchBoardUsers();
  }, [boardId, dispatch]);
};

import { IUser } from '@kanban-board/shared';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setBoards } from '../../../core/store/boards/boardsSlice';
import { getMyBoards } from '../services/boards.service';

interface Props {
  user: IUser | null;
}

export default function useDashboardData(props: Props) {
  const dispatch = useDispatch();
  const { user } = props;
  useEffect(() => {
    if (!user) return;
    const loadBoards = async () => {
      try {
        const res = await getMyBoards();
        const savedBoardId = localStorage.getItem('selectedBoardId');
        const selectedBoardId = savedBoardId ?? null;
        dispatch(setBoards({ boards: res.data, selectedBoardId }));
      } catch (e) {
        console.error('Failed to load boards', e);
      }
    };
    loadBoards();
  }, [user, dispatch]);
}

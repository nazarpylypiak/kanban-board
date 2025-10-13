import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../core/store';
import { addBoard, setBoards } from '../../../../core/store/boards/boardsSlice';
import { setUsers } from '../../../../core/store/usersSlice';
import {
  create,
  getMyBoards
} from '../../../../shared/services/boards.service';
import { getAllUsers } from '../../../../shared/services/user.service';
import AddNewBoard from '../../components/AddNewBoard';
import BoardDropdown from './BoardDropdown';
import { useBoardEvents } from './hooks/useBoardEvents';

export default function BoardSelector() {
  const user = useSelector((state: RootState) => state.auth.user);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;
    const loadBoards = async () => {
      try {
        const res = await getMyBoards();
        dispatch(setBoards(res.data));
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

  useBoardEvents(user);

  const handleCreateBoard = useCallback(
    async (name: string) => {
      const newBoard = await create({ name });
      dispatch(addBoard(newBoard));
    },
    [dispatch]
  );

  return (
    <div className="board-selector p-4 w-full bg-white shadow rounded relative">
      <div className="flex gap-2">
        <AddNewBoard onBoardCreate={(name) => handleCreateBoard(name)} />

        <BoardDropdown user={user} />
      </div>
    </div>
  );
}

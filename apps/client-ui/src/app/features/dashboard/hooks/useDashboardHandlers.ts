import { Dispatch, SetStateAction } from 'react';
import { useDispatch } from 'react-redux';
import { addBoard } from '../../../core/store/boards/boardsSlice';
import { createBoard } from '../services/boards.service';

interface Props {
  setSearch: Dispatch<SetStateAction<string>>;
  closeMenu: () => void;
  search: string;
}

export default function useDshboardHandlers(props: Props) {
  const { setSearch, search, closeMenu } = props;
  const dispatch = useDispatch();
  const handleCreateBoard = async () => {
    try {
      if (!search.trim()) return;
      const res = await createBoard({ name: search });
      dispatch(addBoard(res.data));
      setSearch('');
      closeMenu();
    } catch (e) {
      console.error('Failed to create board', e);
    }
  };

  return { handleCreateBoard };
}

import { Dispatch, SetStateAction } from 'react';
import { useDispatch } from 'react-redux';
import { addBoard } from '../../../core/store/boards/boardsSlice';
import { createBoard } from '../../../shared/services/boards.service';

interface Props {
  setSearch: Dispatch<SetStateAction<string>>;
  search: string;
}

export default function useDshboardHandlers(props: Props) {
  const { setSearch, search } = props;
  const dispatch = useDispatch();
  const handleCreateBoard = async () => {
    try {
      const res = await createBoard({ name: search });
      dispatch(addBoard(res.data));
      setSearch('');
    } catch (e) {
      console.error('Failed to create board', e);
    }
  };

  return { handleCreateBoard };
}

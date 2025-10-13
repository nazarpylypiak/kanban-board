import { useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import Board from '../containers/board/Board';
import BoardSelector from '../containers/board/BoardSelector';

export default function DashboardPage() {
  const selectedBoard = useSelector(
    (state: RootState) => state.boards.selectedBoard
  );

  return (
    <>
      <BoardSelector />
      {selectedBoard && <Board board={selectedBoard} />}
    </>
  );
}

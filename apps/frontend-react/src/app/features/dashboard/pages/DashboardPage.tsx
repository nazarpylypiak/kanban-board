import { useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import Board from '../containers/Board';
import BoardSelector from '../containers/BoardSelector';

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

import { IBoard } from '@kanban-board/shared';
import { useState } from 'react';
import Board from '../containers/Board';
import BoardSelector from '../containers/BoardSelector';

export default function DashboardPage() {
  const [currentBoard, setCurrentBoard] = useState<IBoard | null>(null);

  return (
    <>
      <BoardSelector onSelectBoard={(board) => setCurrentBoard(board)} />
      {currentBoard && <Board />}
    </>
  );
}

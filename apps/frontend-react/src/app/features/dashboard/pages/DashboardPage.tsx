import { IBoard } from '@kanban-board/shared';
import { useState } from 'react';
import Board from '../containers/Board';
import BoardSelector from '../containers/BoardSelector';

export default function DashboardPage() {
  const [currentBoard, onSelectCurrentBoard] = useState<IBoard | null>(null);

  return (
    <>
      <BoardSelector
        onSelectCurrentBoard={(board) => onSelectCurrentBoard(board)}
        currentBoard={currentBoard}
      />
      {currentBoard && <Board board={currentBoard} />}
    </>
  );
}

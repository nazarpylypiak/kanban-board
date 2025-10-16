import { IBoard } from '@kanban-board/shared';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../core/store';
import { setSelectedBoard } from '../../core/store/boards/boardsSlice';
import Board from './containers/board/Board';
import SecondAppBar from './containers/board/SecondAppBar';
import { useBoardNotification } from './hooks/useBoardNotification';
import useDashboardData from './hooks/useDashboardData';
import BoardSelectModal from './modals/BoardSelectModal';

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const selectedBoard = useSelector(
    (state: RootState) => state.boards.selectedBoard
  );
  const isOwner = user?.id === selectedBoard?.ownerId;

  const handleOpen = (event: any) => {
    setOpen(true);
    (event.currentTarget as HTMLButtonElement).blur();
  };
  const handleClose = () => setOpen(false);

  useDashboardData({ user });

  const handleBoardSelect = (board?: IBoard | null) => {
    if (board) {
      localStorage.setItem('selectedBoardId', board.id);
      dispatch(setSelectedBoard(board));
    }
    handleClose();
  };
  useBoardNotification();

  return (
    <>
      <SecondAppBar board={selectedBoard} isOwner={isOwner} user={user} />
      {selectedBoard ? (
        <Board board={selectedBoard} isOwner={isOwner} />
      ) : (
        <div className="text-gray-500 text-center py-4">
          No boards available
        </div>
      )}
      <Tooltip title="Select Board">
        <Fab
          color="primary"
          aria-label="select board"
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            boxShadow: 3,
            zIndex: 1000
          }}
        >
          <CalendarViewWeekIcon />
        </Fab>
      </Tooltip>
      <BoardSelectModal open={open} onClose={handleBoardSelect} />
    </>
  );
}

import { IBoard, IColumn } from '@kanban-board/shared';
import { Box, Button, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../core/store';
import AddNewColumn from '../../components/AddNewColumn';
import ShareBoardModal from '../../modals/ShareBoardModal';
import Column from '../column/Column';
import {
  useBoardData,
  useBoardUsers,
  useMonitorDnD,
  useTaskEvents
} from './hooks';
import useBoardHandlers from './hooks/useBoardHandlers';

interface BoardProps {
  board: IBoard;
}

export default function Board({ board }: BoardProps) {
  const columns = useSelector((state: RootState) => state.columns.data);
  const user = useSelector((state: RootState) => state.auth.user);
  const { containerRef, handleAddColumn } = useBoardData(board.id);
  const isOwner = user?.id === board.ownerId;
  const [open, setOpen] = useState(false);
  const users = useSelector((state: RootState) => state.users.data);
  const filteredUsers = useMemo(
    () => users.filter(({ id }) => id !== user?.id),
    [user?.id, users]
  );

  const { handleDeleteBoard, handleShareBoard } = useBoardHandlers();
  useBoardUsers({ boardId: board.id });
  useTaskEvents(user);
  useMonitorDnD(columns);

  const handleOpen = (e: any) => {
    (e.currentTarget as HTMLButtonElement).blur();
    setOpen(true);
  };

  return (
    <>
      <Box
        className="backdrop-blur-md bg-white/30 p-4 rounded-xl shadow"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          background: 'transparent',
          alignItems: 'center',
          px: 3,
          py: 2,
          borderBottom: '1px solid #ddd',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        {/* Left: Board name */}
        <Typography variant="h6" fontWeight={600}>
          {board?.name || 'Untitled Board'}
        </Typography>

        {/* Right: Actions */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={(e) => handleOpen(e)}
            variant="outlined"
            color="primary"
          >
            Share
          </Button>

          <ShareBoardModal
            board={board}
            users={filteredUsers}
            onShare={(boardId, userIds) => handleShareBoard(boardId, userIds)}
            onClose={() => setOpen(false)}
            open={open}
          />

          {isOwner && (
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDeleteBoard(board.id)}
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>
      <main
        ref={containerRef}
        className="flex gap-4 pt-4 pr-4 pb-4 overflow-x-auto flex-1  h-screen"
      >
        <div className="flex gap-4 items-start">
          {columns.length > 0 &&
            columns.map((c: IColumn) => (
              <Column key={c.id} column={c} isOwner={isOwner} user={user} />
            ))}

          {isOwner && (
            <AddNewColumn onAddColumn={(name) => handleAddColumn(name)} />
          )}
        </div>
      </main>
    </>
  );
}

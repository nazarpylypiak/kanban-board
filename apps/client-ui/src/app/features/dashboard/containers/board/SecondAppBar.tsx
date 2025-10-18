import { IBoard, IUser } from '@kanban-board/shared';
import { Box, Button, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../core/store';
import ShareBoardModal from '../../modals/ShareBoardModal';
import useBoardHandlers from './hooks/useBoardHandlers';

interface Props {
  board: IBoard | null;
  isOwner: boolean;
  user: IUser | null;
}

export default function SecondAppBar(props: Props) {
  const { board, isOwner, user } = props;
  const [open, setOpen] = useState(false);
  const users = useSelector((state: RootState) => state.users.data);

  const filteredUsers = useMemo(
    () => users?.filter(({ id }) => id !== user?.id),
    [user?.id, users]
  );

  const { handleDeleteBoard, handleShareBoard } = useBoardHandlers();

  const handleOpen = (e: any) => {
    (e.currentTarget as HTMLButtonElement).blur();
    setOpen(true);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'grey.100',
        px: 3,
        py: 1.5,
        position: 'sticky',
        top: 64,
        zIndex: 5
      }}
    >
      {board?.id && (
        <Typography
          variant="h6"
          fontWeight={600}
          color="text.primary"
          sx={{ letterSpacing: '-0.01em' }}
        >
          {board?.name || 'Untitled Board'}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {isOwner && (
          <Button
            variant="outlined"
            onClick={handleOpen}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              borderColor: 'grey.400',
              color: 'text.primary',
              bgcolor: 'grey.50',
              '&:hover': { borderColor: 'grey.500', bgcolor: 'grey.100' }
            }}
          >
            Share
          </Button>
        )}

        <ShareBoardModal
          board={board}
          users={filteredUsers}
          onShare={(boardId, userIds) => handleShareBoard(boardId, userIds)}
          onClose={() => setOpen(false)}
          open={open}
        />

        {isOwner && board?.id && (
          <Button
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              bgcolor: 'error.light',
              color: 'white',
              '&:hover': { bgcolor: 'error.main' }
            }}
            onClick={() => handleDeleteBoard(board.id)}
          >
            Delete
          </Button>
        )}
      </Box>
    </Box>
  );
}

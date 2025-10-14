import { IBoard, IUser } from '@kanban-board/shared';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Typography
} from '@mui/material';
import { useState } from 'react';

interface ShareBoardModalProps {
  board: IBoard;
  users: IUser[]; // всі користувачі, з ким можна ділитися
  open: boolean;
  onClose: () => void;
  onShare: (boardId: string, userIds: string[]) => void;
}

export default function ShareBoardModal({
  board,
  users,
  open,
  onClose,
  onShare
}: ShareBoardModalProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    board.sharedUserIds || []
  );

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = () => {
    onShare(board.id, selectedUserIds);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Share "{board.name}"</DialogTitle>
      <DialogContent dividers>
        {users.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No users available to share with.
          </Typography>
        ) : (
          <FormGroup>
            {users.map((user) => (
              <FormControlLabel
                key={user.id}
                control={
                  <Checkbox
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                  />
                }
                label={user.email}
              />
            ))}
          </FormGroup>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

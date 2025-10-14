import { IBoard } from '@kanban-board/shared';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../core/store';

interface Props {
  open: boolean;
  onClose: (board?: IBoard | null) => void;
}

export default function BoardSelectModal({ open, onClose }: Props) {
  const boards = useSelector((state: RootState) => state.boards.data);
  const currentBoard = useSelector(
    (state: RootState) => state.boards.selectedBoard
  );

  const handleSelect = (board: any) => onClose(board);

  return (
    <Dialog open={open} onClose={() => onClose()} fullWidth maxWidth="xs">
      <DialogTitle>Select a Board</DialogTitle>
      <DialogContent>
        {boards.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No boards found.
          </Typography>
        ) : (
          <List>
            {boards.map((board) => (
              <ListItem key={board.id} disablePadding>
                <ListItemButton
                  autoFocus
                  selected={currentBoard?.id === board.id}
                  onClick={() => handleSelect(board)}
                >
                  <ListItemText primary={board.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()} aria-hidden={false}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

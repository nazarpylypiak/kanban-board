import { IUser } from '@kanban-board/shared';
import { useState } from 'react';
// import Select from 'react-select';
import { Button } from '@mui/material';
import { TCreateTask } from '../../../shared/types/task.type';
import AddTaskModal from '../modals/AddTaskModal';
interface Props {
  onCreateTask: (task: TCreateTask) => void;
  users: IUser[];
  currentUser: IUser | null;
}

export default function AddNewTask({
  onCreateTask,
  users,
  currentUser
}: Props) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (task: TCreateTask | null) => {
    if (task) onCreateTask(task);
    setOpen(false);
  };
  const handleOpen = (event: any) => {
    (event.currentTarget as HTMLButtonElement).blur();
    setOpen(true);
  };

  return (
    <>
      <Button
        variant="contained"
        color="inherit" // Neutral color
        fullWidth
        onClick={(e) => handleOpen(e)}
        sx={{
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
          bgcolor: 'grey.200',
          color: 'text.primary',
          boxShadow: 1,
          '&:hover': {
            bgcolor: 'grey.300',
            boxShadow: 2
          }
        }}
      >
        + New Task
      </Button>

      <AddTaskModal
        open={open}
        onClose={(t) => handleSubmit(t)}
        users={users}
        boardOwner={currentUser}
      />
    </>
  );
}

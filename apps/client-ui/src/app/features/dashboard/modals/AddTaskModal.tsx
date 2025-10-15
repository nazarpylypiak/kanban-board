import { IUser } from '@kanban-board/shared';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { TCreateTask } from '../../../shared/types/task.type';

interface Props {
  boardOwner: IUser | null;
  users: IUser[];
  open: boolean;
  onClose: (task: TCreateTask | null) => void;
}

export default function AddTaskModal(props: Props) {
  const { onClose, open, users, boardOwner } = props;

  const [error, setError] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [assignees, setAssignees] = useState<IUser[]>(
    boardOwner?.id ? [boardOwner] : []
  );

  const handleClose = () => {
    resetForm();
    onClose(null);
  };

  const resetForm = () => {
    setTaskName('');
    setDescription('');
    setAssignees(boardOwner?.id ? [boardOwner] : []);
  };

  const handleSubmit = () => {
    if (!taskName.trim()) {
      setError(true);
      return;
    }

    const newTask: TCreateTask = {
      title: taskName,
      description: description,
      assigneeIds: assignees.map(({ id }) => id),
      isDone: false
    };

    onClose(newTask);
    resetForm();
  };

  const handleDelete = (user: IUser) => {
    setAssignees((curr) => curr.filter(({ id }) => id !== user.id));
  };
  return (
    <Dialog
      onClose={handleClose}
      open={open}
      slotProps={{
        paper: {
          sx: {
            minWidth: 500,
            maxWidth: '80vw',
            borderRadius: 2,
            bgcolor: 'background.paper',
            p: 2
          }
        }
      }}
    >
      <DialogTitle fontWeight={600} fontSize="1.25rem">
        Create New Task
      </DialogTitle>

      <Box
        component="form"
        noValidate
        autoComplete="off"
        sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <TextField
          label="Task name"
          variant="outlined"
          size="small"
          fullWidth
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onBlur={() => taskName.trim() && setError(false)}
          error={error}
          helperText={error ? 'Task name is required' : ''}
        />

        <TextField
          label="Description"
          multiline
          rows={4}
          variant="outlined"
          size="small"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Selected Assignees */}
        {assignees.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {assignees.map((user) => (
              <Chip
                key={user.id}
                label={user.email}
                color="default"
                variant="outlined"
                size="small"
                onDelete={() => handleDelete(user)}
              />
            ))}
          </Box>
        )}

        <Autocomplete
          multiple
          id="share-board-users"
          noOptionsText="No users available"
          options={users.filter(
            (u) => !assignees.some(({ id }) => u.id === id)
          )}
          value={assignees}
          onChange={(_, newValue) => setAssignees(newValue)}
          getOptionLabel={(option) => option?.email ?? ''}
          renderValue={() => null}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Assign users..."
              variant="outlined"
              size="small"
              fullWidth
            />
          )}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" color="inherit" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Create
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

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
    setAssignees([]);
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
            maxWidth: '80vw'
          }
        }
      }}
    >
      <DialogTitle>Create New Task</DialogTitle>

      <Box
        component="form"
        noValidate
        autoComplete="off"
        className="flex flex-col gap-4 p-4 bg-white rounded-xl"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* Task name */}
        <TextField
          id="outlined-basic"
          label="Task name"
          variant="outlined"
          size="small"
          className="w-full"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onBlur={() => taskName.trim() && setError(false)}
          error={error}
          helperText={error ? 'Task name is required' : ''}
        />

        {/* Description */}
        <TextField
          id="outlined-multiline-static"
          label="Description"
          multiline
          rows={4}
          variant="outlined"
          size="small"
          className="w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Assignees */}
        {assignees.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {assignees.map((user) => (
              <Chip
                key={user.id}
                label={user.email}
                color="primary"
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
              variant="outlined"
              placeholder="Share with users..."
              size="small"
              className="w-full"
            />
          )}
        />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Create
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

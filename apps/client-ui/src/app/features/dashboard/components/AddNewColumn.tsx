import { Box, Button, TextField } from '@mui/material';
import { useState } from 'react';

interface Props {
  onAddColumn: (name: string) => void;
}
export default function AddNewColumn({ onAddColumn }: Props) {
  const [newColumnName, setNewColumnName] = useState('');
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newColumnName) return;
    onAddColumn(newColumnName);
    setNewColumnName('');
  };

  return (
    <Box
      sx={{
        width: 250,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        p: 2,
        bgcolor: 'grey.100',
        borderRadius: 2,
        boxShadow: 1
      }}
    >
      <TextField
        value={newColumnName}
        onChange={(e) => setNewColumnName(e.target.value)}
        placeholder="Enter column name..."
        variant="outlined"
        size="small"
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper'
          }
        }}
      />

      <Button
        onClick={handleAddColumn}
        variant="contained"
        fullWidth
        sx={{
          bgcolor: 'grey.300',
          color: 'text.primary',
          fontWeight: 600,
          textTransform: 'none',
          '&:hover': {
            bgcolor: 'grey.400'
          }
        }}
      >
        Add Column
      </Button>
    </Box>
  );
}

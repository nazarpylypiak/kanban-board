import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { MouseEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAdmin } from '../../../../core/store/selectors/authSelectors';
import { TRules } from '../../containers/column/types/rules.type';

interface Props {
  title: string;
  isDone?: boolean;
  onRuleAdded: (rules: any) => void;
}
export default function ColumnHeader({ title, isDone, onRuleAdded }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleToggle = (value: TRules) => {
    onRuleAdded(value);
  };
  const isAdmin = useSelector(selectIsAdmin);
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>

        {isAdmin && (
          <Button
            onClick={handleClick}
            sx={{
              minWidth: 0,
              p: 0.5,
              color: 'grey.700',
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            <MoreHorizIcon />
          </Button>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: { 'aria-labelledby': 'basic-button' },
          paper: {
            sx: {
              minWidth: 200,
              borderRadius: 1,
              bgcolor: 'grey.50',
              boxShadow: 2
            }
          }
        }}
      >
        <MenuItem
          onClick={() => {
            handleToggle({ isDone: !isDone });
            handleClose();
          }}
        >
          <Checkbox checked={!!isDone} sx={{ p: 0, mr: 1 }} />
          <ListItemText primary="Mark as completed" />
        </MenuItem>
      </Menu>
    </Box>
  );
}

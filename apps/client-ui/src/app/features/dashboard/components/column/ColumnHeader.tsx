import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { MouseEvent, useState } from 'react';
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
  return (
    <div>
      <div className="flex justify-between">
        <h2 className="font-bold mb-2">{title}</h2>
        <Button
          id="basic-button"
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          <MoreHorizIcon />
        </Button>
      </div>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'basic-button'
          }
        }}
      >
        <MenuItem
          onClick={() => handleToggle({ isDone: !isDone })}
          value="Task completed"
        >
          <Checkbox checked={!!isDone} />
          <ListItemText primary="Make task completed" />
        </MenuItem>
      </Menu>
    </div>
  );
}

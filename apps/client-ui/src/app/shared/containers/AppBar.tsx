import SearchIcon from '@mui/icons-material/Search';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Link from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha, styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../core/store';
import useDshboardHandlers from '../../features/dashboard/hooks/useDashboardHandlers';
import { useLogout } from '../hooks/logout';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25)
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto'
  },
  border: '1px solid black',

  // NEW: match button height
  display: 'flex',
  alignItems: 'center',
  height: 36 // default MUI button height for small/outlined
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(0, 1, 0, 0), // vertical padding 0, horizontal padding 1
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    height: '100%',
    boxSizing: 'border-box'
  }
}));

export default function SearchAppBar() {
  const [search, setSearch] = useState('');
  const user = useSelector((state: RootState) => state.auth.user);
  const { handleLogout } = useLogout();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const { handleCreateBoard } = useDshboardHandlers({ setSearch, search });
  return (
    <AppBar
      className="rounded-xl"
      position="static"
      color="default"
      elevation={2}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', mr: 3 }}>
          <Typography variant="h6" noWrap>
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', mr: 3 }}>
            <Typography sx={{ mr: 2 }} variant="body2" color="text.secondary">
              {user ? `User: ${user.email}` : 'Loading user...'}
            </Typography>
            <Link
              href="http://localhost:4200"
              color="primary"
              underline="hover"
              variant="body2"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontWeight: 500 }}
            >
              Admin Panel
            </Link>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
          <Button
            id="basic-button"
            sx={{ mr: 3, height: 36 }}
            variant="outlined"
            color="inherit"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            Create
          </Button>
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
            <MenuItem onClick={handleCreateBoard}>Create Board</MenuItem>
          </Menu>

          <Button
            sx={{ height: 36 }}
            variant="contained"
            color="secondary"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

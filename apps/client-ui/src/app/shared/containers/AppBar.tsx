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
  borderRadius: 6,
  backgroundColor: alpha(theme.palette.grey[800], 0.6),
  '&:hover': {
    backgroundColor: alpha(theme.palette.grey[700], 0.8)
  },
  display: 'flex',
  alignItems: 'center',
  height: 38,
  width: 250,
  paddingLeft: theme.spacing(1),
  border: `1px solid ${theme.palette.grey[600]}`
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  marginRight: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.grey[400]
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  flex: 1,
  fontSize: '0.875rem',
  color: theme.palette.grey[100],
  '& .MuiInputBase-input': {
    padding: 0
  }
}));

export default function SearchAppBar() {
  const [search, setSearch] = useState('');
  const user = useSelector((state: RootState) => state.auth.user);
  const { handleLogout } = useLogout();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const { handleCreateBoard } = useDshboardHandlers({
    closeMenu: handleClose,
    setSearch,
    search
  });
  const isAdmin = user?.role === 'admin';

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: 'grey.900',
        borderBottom: '1px solid',
        borderColor: 'grey.800'
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h5" fontWeight={600} color="grey.100">
            Kanban Board
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
            <Typography variant="body2" color="grey.400">
              {user ? `User: ${user.email}` : 'Loading user...'}
            </Typography>
            {isAdmin && (
              <Link
                href="http://localhost:4200"
                underline="hover"
                variant="body2"
                color="grey.300"
                sx={{ fontWeight: 600 }}
              >
                Admin Panel
              </Link>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon fontSize="small" />
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
            variant="outlined"
            onClick={handleClick}
            sx={{
              height: 38,
              px: 3,
              fontWeight: 600,
              textTransform: 'none',
              borderColor: 'grey.700',
              color: 'grey.200',
              bgcolor: 'grey.800',
              '&:hover': {
                borderColor: 'grey.600',
                bgcolor: 'grey.700'
              }
            }}
          >
            Create
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{ list: { 'aria-labelledby': 'basic-button' } }}
            sx={{
              '& .MuiPaper-root': {
                bgcolor: 'grey.900',
                color: 'grey.100',
                border: '1px solid',
                borderColor: 'grey.800'
              },
              '& .MuiMenuItem-root:hover': {
                bgcolor: 'grey.800'
              }
            }}
          >
            <MenuItem onClick={handleCreateBoard}>Create Board</MenuItem>
          </Menu>

          <Button
            sx={{
              height: 38,
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: 'grey.700',
              color: 'grey.100',
              '&:hover': { bgcolor: 'grey.600' }
            }}
            variant="contained"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

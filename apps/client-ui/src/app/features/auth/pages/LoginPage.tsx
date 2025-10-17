import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  setAccessToken,
  setLoggedIn
} from '../../../core/store/auth/authSlice';
import { login } from '../services/auth.service';

import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  TextField,
  Typography
} from '@mui/material';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(email, password);

      dispatch(setAccessToken(data.accessToken));
      dispatch(setLoggedIn(true));

      navigate('/dashboard');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 400,
          width: '100%',
          p: 4,
          borderRadius: 3
        }}
      >
        <Typography variant="h4" fontWeight={600} align="center" gutterBottom>
          Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            size="small"
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            size="small"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 1, py: 1.5 }}
          >
            Login
          </Button>
        </Box>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 3, color: 'text.secondary' }}
        >
          Don't have an account?{' '}
          <Link
            component={RouterLink}
            to="/register"
            underline="hover"
            color="success.main"
          >
            Register here
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

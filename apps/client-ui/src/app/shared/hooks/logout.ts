import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../../core/store/auth/authSlice';
import { logout } from '../../features/auth/services/auth.service';

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      console.error(err);
    } finally {
      dispatch(clearAuth());
      navigate('/login');
    }
  };

  return { handleLogout };
};

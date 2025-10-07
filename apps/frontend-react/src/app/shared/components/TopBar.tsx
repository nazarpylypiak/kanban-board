import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../core/store';
import { clearAuth, setUser } from '../../core/store/authSlice';
import { logout } from '../../features/auth/services/auth.service';
import { getProfile } from '../services/user.service';

export default function TopBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const user = useSelector((state: RootState) => state.auth.user);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (accessToken && !hasFetched.current) {
      hasFetched.current = true;
      const fetchUser = async () => {
        try {
          const data = await getProfile();
          dispatch(setUser(data));
        } catch (err) {
          console.error('Failed to load profile', err);
        }
      };
      fetchUser();
    }
  }, [accessToken, dispatch]);

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

  return (
    <header className="flex justify-between items-center mb-8 p-4 bg-white shadow rounded">
      <div className="flex items-end w-full">
        <div className="mr-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            User: {user ? user.email : 'loading...'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <a
            href="http://localhost:4200"
            className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium mt-1 inline-block"
            target="_blank"
            rel="noopener noreferrer"
          >
            Go to Admin Panel
          </a>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="text-sm text-red-600 hover:text-red-800 underline ml-4"
      >
        Logout
      </button>
    </header>
  );
}

import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth.service';
import { setAccessToken, setLoggedIn } from '../store/authSlice';

export default function TopBar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      console.error(err);
    } finally {
      setAccessToken(null);
      setLoggedIn(false);
      navigate('/login');
    }
  };
  return (
    <header className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">User ID: {'userId'}</p>
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Logout
      </button>
    </header>
  );
}

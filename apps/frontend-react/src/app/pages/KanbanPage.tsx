// src/app/pages/KanbanPage.tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function KanbanPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = token ? JSON.parse(atob(token.split('.')[1])).sub : 'Unknown';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Kanban Board</h1>
          <p className="text-gray-600">User ID: {userId}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </header>

      <main className="flex gap-4">
        {/* Placeholder for boards */}
        <div className="flex-1 p-4 bg-white rounded shadow">
          <p className="text-gray-500">Your Kanban boards will appear here.</p>
        </div>
      </main>
    </div>
  );
}

import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import TopBar from '../../shared/components/TopBar';
import { RootState } from '../store';

export default function PrivateLayout() {
  const { accessToken, loading } = useSelector(
    (state: RootState) => state.auth
  );

  if (loading) return <div>Loading...</div>;
  if (!accessToken) return <Navigate to="/login" replace />;

  return (
    <div className="flex flex-col h-screen min-h-screen bg-gray-100 p-8">
      <TopBar />
      <Outlet />
    </div>
  );
}

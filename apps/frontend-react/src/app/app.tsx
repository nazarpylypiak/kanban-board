import { useInitializeAuth } from './core/hooks/initializeAuthData';
import { useInitializeSocket } from './core/hooks/initializeSocket';
import { AppRoutes } from './routes/AppRoutes';

export const App = () => {
  useInitializeSocket();
  useInitializeAuth();

  return <AppRoutes />;
};

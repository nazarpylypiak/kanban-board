import { useAuth } from './core/hooks/useAuth';
import { AppRoutes } from './routes/AppRoutes';

export const App = () => {
  useAuth();

  return <AppRoutes />;
};

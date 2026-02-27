import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Redireciona profissionais (PROVIDER/ADMIN) para /agenda.
 * Usado nas rotas de agendamento para que só clientes vejam a página de escolher serviço.
 */
export function ClientOnlyRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const role = user?.role != null ? String(user.role).toUpperCase() : '';
  const isProvider = role === 'PROVIDER' || role === 'ADMIN';

  if (user && isProvider) {
    return <Navigate to="/agenda" replace />;
  }

  return <>{children}</>;
}

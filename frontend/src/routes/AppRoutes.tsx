import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastContainer } from '../components/ui/ToastContainer';
import { GlobalLoading } from '../components/ui/GlobalLoading';
import { ProtectedRoute } from './ProtectedRoute';
import { ClientOnlyRoute } from './ClientOnlyRoute';
import { UserRole } from '../types/auth.types';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Dashboard from '../pages/dashboard/Dashboard';
import NewAppointment from '../pages/dashboard/NewAppointment';
import Agenda from '../pages/appointments/Agenda';
import ViewAppointment from '../pages/appointments/ViewAppointment';
import EditAppointment from '../pages/appointments/EditAppointment';
import ManageAvailability from '../pages/availability/ManageAvailability';
import BookAppointment from '../pages/appointments/BookAppointment';
import Layout from '../components/layout/Layout';
import PublicLayout from '../components/layout/PublicLayout';
import Home from '../pages/public/Home';
import SelectProvider from '../pages/public/SelectProvider';
import PublicBookAppointment from '../pages/public/PublicBookAppointment';
import PublicBookForm from '../pages/public/PublicBookForm';
import Confirmation from '../pages/public/Confirmation';
import ConsultAppointment from '../pages/public/ConsultAppointment';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import RegisterClient from '../pages/clients/RegisterClient';
import ClientsList from '../pages/clients/ClientsList';
import ClientDetail from '../pages/clients/ClientDetail';
import ClientBookAppointment from '../pages/clients/ClientBookAppointment';
import Plans from '../pages/billing/Plans';
import BillingSuccess from '../pages/billing/BillingSuccess';
import Profile from '../pages/profile/Profile';
import Settings from '../pages/settings/Settings';

export function AppRoutes() {
  return (
    <AuthProvider>
      <GlobalLoading />
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          {/* ============================================ */}
          {/* ROTAS PÚBLICAS (sem autenticação) */}
          {/* ============================================ */}
          
          {/* Página inicial - Landing SaaS (Agendar + Criar conta profissional) */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          
          {/* Alias: mesma landing para links antigos */}
          <Route path="/para-profissionais" element={<PublicLayout><Home /></PublicLayout>} />
          
          {/* Seleção de provider para agendamento */}
          <Route path="/select-provider" element={<PublicLayout><SelectProvider /></PublicLayout>} />
          
          {/* Agendamento público (sem login) */}
          <Route path="/book/:providerId" element={<PublicLayout><PublicBookAppointment /></PublicLayout>} />
          <Route path="/book/:providerId/dados" element={<PublicLayout><PublicBookForm /></PublicLayout>} />
          
          {/* Confirmação de agendamento público */}
          <Route path="/confirm/:token" element={<PublicLayout><Confirmation /></PublicLayout>} />
          
          {/* Consulta de agendamento público */}
          <Route path="/consult" element={<PublicLayout><ConsultAppointment /></PublicLayout>} />

          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
          <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
          <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />

          {/* ============================================ */}
          {/* ROTAS PRIVADAS (com autenticação) */}
          {/* ============================================ */}
          
          {/* Rotas protegidas para providers */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/agendar" element={<ClientOnlyRoute><NewAppointment /></ClientOnlyRoute>} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/appointments/:id" element={<ViewAppointment />} />
              <Route path="/appointments/:id/edit" element={<EditAppointment />} />
              <Route path="/billing/plans" element={<Plans />} />
              <Route path="/billing/success" element={<BillingSuccess />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              {/* Agendamento para usuários logados (mantido para compatibilidade) */}
              <Route path="/app/book/:providerId" element={<ClientOnlyRoute><BookAppointment /></ClientOnlyRoute>} />
            </Route>
          </Route>

          {/* Rotas protegidas apenas para providers */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.PROVIDER, UserRole.ADMIN]} />}>
            <Route element={<Layout />}>
              <Route path="/availability" element={<ManageAvailability />} />
              <Route path="/clients" element={<ClientsList />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/clients/:id/agendar" element={<ClientBookAppointment />} />
              <Route path="/register-client" element={<RegisterClient />} />
            </Route>
          </Route>

          {/* Rotas protegidas com roles específicas */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
            <Route element={<Layout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>
          </Route>

          {/* Rota padrão para rotas não encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

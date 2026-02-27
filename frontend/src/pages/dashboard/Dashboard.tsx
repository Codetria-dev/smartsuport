import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { appointmentService } from '../../services/appointmentService';
import { Appointment, AppointmentStatus } from '../../types/appointment';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'dashboard']);
  const [agendamentos, setAgendamentos] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFromApi, setRoleFromApi] = useState<string | null>(null);

  const role = roleFromApi ?? (user?.role != null ? String(user.role).toUpperCase() : '');
  const isProvider = role === 'PROVIDER' || role === 'ADMIN';
  const canShowActions = roleFromApi !== null;

  useEffect(() => {
    loadMyAppointments();
  }, []);

  useEffect(() => {
    let cancelled = false;
    authService.getProfile().then((profile) => {
      if (!cancelled) setRoleFromApi(String(profile.role).toUpperCase());
    }).catch(() => {
      if (!cancelled) setRoleFromApi(user?.role != null ? String(user.role).toUpperCase() : '');
    });
    return () => { cancelled = true; };
  }, [user?.role]);

  const loadMyAppointments = async () => {
    try {
      setLoading(true);
      const appointments = await appointmentService.getMyAppointments();
      setAgendamentos(appointments);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setAgendamentos([]);
    } finally {
      setLoading(false);
    }
  };

  // Próximo agendamento (mais próximo no futuro)
  const proximoAgendamento = agendamentos
    .filter((a) =>
      a.status !== AppointmentStatus.CANCELLED &&
      new Date(a.startTime) > new Date()
    )
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

  const totalAgendamentos = agendamentos.length;
  const servicosAtivos = agendamentos.filter(
    (a) => a.status === AppointmentStatus.CONFIRMED || a.status === AppointmentStatus.PENDING
  ).length;
  const pendentesConfirmacao = agendamentos.filter((a) => a.status === AppointmentStatus.PENDING).length;

  // Nome do cliente (agendamento público sem login usa clientName/clientEmail)
  const getClientDisplay = (a: Appointment) =>
    a.client ? a.client.name : a.clientName || a.clientEmail || t('dashboard:clientLabel');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="dashboard-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <div className="dashboard-subtitle">{t('common:loading')}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      <div>
        <h1 className="dashboard-title">
          {t('dashboard:welcome', { name: user?.name || t('dashboard:welcomeUser') })}
        </h1>
        <p className="dashboard-subtitle">
          {isProvider ? t('dashboard:summarySubtitleProvider') : t('dashboard:summarySubtitle')}
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>{isProvider ? t('dashboard:nextReceived') : t('dashboard:nextAppointment')}</h2>
          {proximoAgendamento ? (
            <div style={{ marginTop: '1rem' }}>
              <p className="dashboard-stat" style={{ fontSize: '1.125rem' }}>
                {proximoAgendamento.serviceType || proximoAgendamento.title || t('dashboard:appointmentDefault')}
              </p>
              <p className="dashboard-stat-label">{formatDate(proximoAgendamento.startTime)}</p>
              <p className="dashboard-stat-label">
                {formatTime(proximoAgendamento.startTime)} - {formatTime(proximoAgendamento.endTime)}
              </p>
              {isProvider ? (
                <p className="dashboard-stat-label" style={{ marginTop: '0.5rem' }}>
                  {t('dashboard:clientLabel')}: {getClientDisplay(proximoAgendamento)}
                </p>
              ) : (
                proximoAgendamento.provider && (
                  <p className="dashboard-stat-label" style={{ marginTop: '0.5rem' }}>
                    {t('dashboard:professional')}: {proximoAgendamento.provider.name}
                  </p>
                )
              )}
            </div>
          ) : (
            <p className="dashboard-stat-label" style={{ marginTop: '1rem' }}>
              {isProvider ? t('dashboard:noReceivedYet') : t('dashboard:noAppointmentScheduled')}
            </p>
          )}
        </div>

        <div className="dashboard-card">
          <h2>{isProvider ? t('dashboard:totalReceived') : t('dashboard:totalAppointments')}</h2>
          <p className="dashboard-stat">{totalAgendamentos}</p>
          <p className="dashboard-stat-label">
            {isProvider ? t('dashboard:allReceived') : t('dashboard:allAppointments')}
          </p>
        </div>

        <div className="dashboard-card">
          <h2>{isProvider ? t('dashboard:pendingConfirmation') : t('dashboard:activeServices')}</h2>
          <p className="dashboard-stat">{isProvider ? pendentesConfirmacao : servicosAtivos}</p>
          <p className="dashboard-stat-label">
            {isProvider ? t('dashboard:pendingConfirmationDesc') : t('dashboard:confirmedAndPending')}
          </p>
        </div>
      </div>

      <div className="dashboard-actions">
        {!canShowActions ? (
          <div className="dashboard-subtitle">{t('common:loading')}</div>
        ) : isProvider ? (
          <>
            <button type="button" onClick={() => navigate('/agenda')} className="btn-dashboard-primary">
              {t('dashboard:viewReceived')}
            </button>
            <button type="button" onClick={() => navigate('/availability')} className="btn-dashboard-secondary">
              {t('dashboard:configureAvailability')}
            </button>
          </>
        ) : (
          <button type="button" onClick={() => navigate('/agenda')} className="btn-dashboard-primary">
            {t('dashboard:viewMyAppointments')}
          </button>
        )}
      </div>
    </div>
  );
}

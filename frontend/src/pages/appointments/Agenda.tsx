import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appointmentService } from '../../services/appointmentService';
import { authService } from '../../services/authService';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { useToast } from '../../contexts/ToastContext';
import Loading from '../../components/ui/Loading';
import { useAuth } from '../../contexts/AuthContext';

export default function Agenda() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['appointments', 'common']);
  const { error: showError } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFromApi, setRoleFromApi] = useState<string | null>(null);

  const role = roleFromApi ?? (user?.role != null ? String(user.role).toUpperCase() : '');
  const isProvider = role === 'PROVIDER' || role === 'ADMIN';

  useEffect(() => {
    loadData();
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

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getMyAppointments();
      setAppointments(data);
    } catch (err: any) {
      showError(err.response?.data?.error || t('common:loadAgendaError'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return t('pending');
      case AppointmentStatus.CONFIRMED:
        return t('confirmed');
      case AppointmentStatus.CANCELLED:
        return t('cancelled');
      case AppointmentStatus.COMPLETED:
        return t('completed');
      case AppointmentStatus.NO_SHOW:
        return t('noShow');
      default:
        return status;
    }
  };

  const getClientDisplay = (a: Appointment) =>
    a.client?.name || a.clientName || a.clientEmail || t('client');

  if (loading) {
    return <Loading fullScreen message={t('common:loadingAgenda')} />;
  }

  if (!user) {
    return <Loading fullScreen message={t('common:loading')} />;
  }

  if (roleFromApi === null) {
    return <Loading fullScreen message={t('common:loading')} />;
  }

  // ——— Vista do profissional: apenas serviços agendados pelos clientes (sem novo agendamento) ———
  if (isProvider) {
    const received = appointments
      .filter((a) => a.status !== AppointmentStatus.CANCELLED)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return (
      <div className="dashboard-main" data-page="agenda-provider">
        <div>
          <h1 className="dashboard-title">{t('agendaReceived')}</h1>
          <p className="dashboard-subtitle">
            {t('agendaReceivedSubtitle')}
          </p>
        </div>

        <p className="dashboard-stat-label" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          <a
            href="/availability"
            onClick={(e) => {
              e.preventDefault();
              navigate('/availability');
            }}
            style={{ color: 'var(--color-brand-darker)', fontWeight: 500 }}
          >
            {t('configureAvailability')}
          </a>
        </p>

        {received.length === 0 ? (
          <div className="dashboard-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="dashboard-stat-label">{t('noReceivedYet')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {received.map((appointment) => {
              const startDate = new Date(appointment.startTime);
              const endDate = new Date(appointment.endTime);
              return (
                <div
                  key={appointment.id}
                  className="dashboard-card"
                  style={{ borderLeft: '4px solid #dc2626' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                        {appointment.title || appointment.serviceType || 'Agendamento'}
                      </h3>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          backgroundColor: appointment.status === AppointmentStatus.PENDING ? '#fef3c7' : appointment.status === AppointmentStatus.CONFIRMED ? '#d1fae5' : '#e0e7ff',
                          color: appointment.status === AppointmentStatus.PENDING ? '#92400e' : appointment.status === AppointmentStatus.CONFIRMED ? '#065f46' : '#3730a3',
                        }}
                      >
                        {getStatusLabel(appointment.status)}
                      </span>
                      <p className="dashboard-stat-label" style={{ marginTop: '0.5rem' }}>
                        <strong>{t('client')}:</strong> {getClientDisplay(appointment)}
                      </p>
                      <p className="dashboard-stat-label">
                        <strong>{t('date')}:</strong>{' '}
                        {startDate.toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="dashboard-stat-label">
                        <strong>{t('time')}:</strong>{' '}
                        {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}{' '}
                        – {endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/appointments/${appointment.id}`)}
                      className="btn-dashboard-secondary"
                    >
                      {t('viewAppointment')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ——— Vista do cliente: lista de agendamentos + novo agendamento ———
  const futureOrRecent = appointments
    .filter((a) => a.status !== AppointmentStatus.CANCELLED)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="dashboard-main" data-page="agenda-client">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <h1 className="dashboard-title">{t('agenda')}</h1>
        <p className="dashboard-subtitle">Seus agendamentos.</p>
      </div>

      {futureOrRecent.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="dashboard-stat-label">{t('noAppointments')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {futureOrRecent.map((appointment) => {
            const startDate = new Date(appointment.startTime);
            const endDate = new Date(appointment.endTime);
            const provider = appointment.provider;

            return (
              <div
                key={appointment.id}
                className="dashboard-card"
                style={{ borderLeft: '4px solid #3b82f6' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                      {appointment.title || 'Agendamento'}
                    </h3>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: appointment.status === AppointmentStatus.PENDING ? '#fef3c7' : appointment.status === AppointmentStatus.CONFIRMED ? '#d1fae5' : '#e0e7ff',
                        color: appointment.status === AppointmentStatus.PENDING ? '#92400e' : appointment.status === AppointmentStatus.CONFIRMED ? '#065f46' : '#3730a3',
                      }}
                    >
                      {getStatusLabel(appointment.status)}
                    </span>
                    <p className="dashboard-stat-label" style={{ marginTop: '0.5rem' }}>
                      <strong>Data:</strong>{' '}
                      {startDate.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="dashboard-stat-label">
                      <strong>Horário:</strong>{' '}
                      {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}{' '}
                      – {endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {provider && (
                      <p className="dashboard-stat-label">
                        <strong>{t('provider')}:</strong> {provider.name}
                        {provider.email ? ` (${provider.email})` : ''}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/appointments/${appointment.id}`)}
                    className="btn-dashboard-secondary"
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

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

  const iconBoxStyle = {
    flexShrink: 0,
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(214,78,56,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const btnPrimaryStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 600,
    background: '#d64e38',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  };

  const btnSecondaryStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 600,
    background: '#fff',
    color: '#374151',
    border: '1.5px solid #d1d5db',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>{t('common:loading')}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '896px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
          {t('dashboard:welcome', { name: user?.name || t('dashboard:welcomeUser') })}
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7280', marginTop: '6px' }}>
          {isProvider ? t('dashboard:summarySubtitleProvider') : t('dashboard:summarySubtitle')}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        {/* Card 1 — Próximo agendamento */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #f0ebe7',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 24px -8px rgba(0,0,0,0.08)',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={iconBoxStyle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d64e38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                {isProvider ? t('dashboard:nextReceived') : t('dashboard:nextAppointment')}
              </h2>
              {proximoAgendamento ? (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                    {proximoAgendamento.serviceType || proximoAgendamento.title || t('dashboard:appointmentDefault')}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '2px 0 0 0' }}>
                    {formatDate(proximoAgendamento.startTime)}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                    {formatTime(proximoAgendamento.startTime)} - {formatTime(proximoAgendamento.endTime)}
                  </p>
                  {isProvider ? (
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                      {t('dashboard:clientLabel')}: {getClientDisplay(proximoAgendamento)}
                    </p>
                  ) : (
                    proximoAgendamento.provider && (
                      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                        {t('dashboard:professional')}: {proximoAgendamento.provider.name}
                      </p>
                    )
                  )}
                </div>
              ) : (
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px' }}>
                  {isProvider ? t('dashboard:noReceivedYet') : t('dashboard:noAppointmentScheduled')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Card 2 — Total */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #f0ebe7',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 24px -8px rgba(0,0,0,0.08)',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={iconBoxStyle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d64e38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                {isProvider ? t('dashboard:totalReceived') : t('dashboard:totalAppointments')}
              </h2>
              <p style={{ fontSize: '32px', fontWeight: 700, color: '#d64e38', margin: '8px 0 0 0', lineHeight: 1 }}>
                {totalAgendamentos}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                {isProvider ? t('dashboard:allReceived') : t('dashboard:allAppointments')}
              </p>
            </div>
          </div>
        </div>

        {/* Card 3 — Pendentes / Ativos */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #f0ebe7',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 24px -8px rgba(0,0,0,0.08)',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={iconBoxStyle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d64e38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>
                {isProvider ? t('dashboard:pendingConfirmation') : t('dashboard:activeServices')}
              </h2>
              <p style={{ fontSize: '32px', fontWeight: 700, color: '#d64e38', margin: '8px 0 0 0', lineHeight: 1 }}>
                {isProvider ? pendentesConfirmacao : servicosAtivos}
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                {isProvider ? t('dashboard:pendingConfirmationDesc') : t('dashboard:confirmedAndPending')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {!canShowActions ? (
          <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>{t('common:loading')}</p>
        ) : isProvider ? (
          <>
            <button
              type="button"
              onClick={() => navigate('/agenda')}
              style={hoveredBtn === 'agenda' ? { ...btnPrimaryStyle, background: '#b83d2a' } : btnPrimaryStyle}
              onMouseEnter={() => setHoveredBtn('agenda')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('dashboard:viewReceived')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/availability')}
              style={hoveredBtn === 'availability' ? { ...btnSecondaryStyle, background: '#f9fafb' } : btnSecondaryStyle}
              onMouseEnter={() => setHoveredBtn('availability')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('dashboard:configureAvailability')}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/agenda')}
            style={hoveredBtn === 'agenda-client' ? { ...btnPrimaryStyle, background: '#b83d2a' } : btnPrimaryStyle}
            onMouseEnter={() => setHoveredBtn('agenda-client')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t('dashboard:viewMyAppointments')}
          </button>
        )}
      </div>
    </div>
  );
}

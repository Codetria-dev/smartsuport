import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types/appointment';
import Button from '../../components/ui/Button';

export default function Confirmation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      loadAppointment();
    }
  }, [token]);

  const loadAppointment = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await appointmentService.getAppointmentByPublicToken(token);
      setAppointment(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Agendamento não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!token) return;

    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    try {
      await appointmentService.cancelPublicAppointment(token);
      loadAppointment();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cancelar agendamento');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Carregando agendamento...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
        <div className="content-card text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Agendamento não encontrado</h1>
          <p className="text-gray-600 mb-6">{error || 'O agendamento solicitado não existe.'}</p>
        </div>
        <div className="absolute bottom-4 left-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            ← Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  const startDate = new Date(appointment.startTime);
  const endDate = new Date(appointment.endTime);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <section className="mb-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="page-title text-2xl md:text-3xl">Agendamento Confirmado!</h1>
          <p className="text-gray-600 text-base">Seu agendamento foi criado com sucesso</p>
        </section>
        <div className="content-card">

          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Data e Horário</p>
              <p className="text-lg text-gray-900">
                {startDate.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-lg text-gray-900">
                {startDate.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                -{' '}
                {endDate.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {appointment.provider && (
              <div>
                <p className="text-sm font-medium text-gray-500">Profissional</p>
                <p className="text-lg text-gray-900">{appointment.provider.name}</p>
                {appointment.provider.email && (
                  <p className="text-sm text-gray-600">{appointment.provider.email}</p>
                )}
              </div>
            )}

            {appointment.clientName && (
              <div>
                <p className="text-sm font-medium text-gray-500">Cliente</p>
                <p className="text-lg text-gray-900">{appointment.clientName}</p>
                {appointment.clientEmail && (
                  <p className="text-sm text-gray-600">{appointment.clientEmail}</p>
                )}
              </div>
            )}

            {appointment.title && (
              <div>
                <p className="text-sm font-medium text-gray-500">Título</p>
                <p className="text-lg text-gray-900">{appointment.title}</p>
              </div>
            )}

            {appointment.description && (
              <div>
                <p className="text-sm font-medium text-gray-500">Descrição</p>
                <p className="text-lg text-gray-900">{appointment.description}</p>
              </div>
            )}

            {appointment.location && (
              <div>
                <p className="text-sm font-medium text-gray-500">Localização</p>
                <p className="text-lg text-gray-900">{appointment.location}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  appointment.status === 'CONFIRMED'
                    ? 'bg-green-100 text-green-800'
                    : appointment.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : appointment.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {appointment.status === 'CONFIRMED'
                  ? 'Confirmado'
                  : appointment.status === 'PENDING'
                  ? 'Pendente'
                  : appointment.status === 'CANCELLED'
                  ? 'Cancelado'
                  : appointment.status}
              </span>
            </div>

          </div>

          <div className="mt-8 space-y-3">
            {appointment.status !== 'CANCELLED' && (
              <Button variant="danger" onClick={handleCancel} className="w-full">
                Cancelar Agendamento
              </Button>
            )}
          </div>
        </div>
        <div className="mt-8 pt-6 text-left">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            ← Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
}

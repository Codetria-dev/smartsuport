import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types/appointment';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ConsultAppointment() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAppointment(null);

    if (!token.trim()) {
      setError('Por favor, informe o token de acesso');
      return;
    }

    try {
      setLoading(true);
      const data = await appointmentService.getAppointmentByPublicToken(token.trim());
      setAppointment(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Agendamento não encontrado. Verifique o token.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!token || !appointment) return;

    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    try {
      await appointmentService.cancelPublicAppointment(token);
      // Recarrega o agendamento após cancelar
      const data = await appointmentService.getAppointmentByPublicToken(token);
      setAppointment(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cancelar agendamento');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <section className="mb-8">
          <h1 className="page-title text-2xl md:text-3xl">Consultar Agendamento</h1>
          <p className="text-gray-600 text-base mt-1">
            Informe o token de acesso para consultar seu agendamento
          </p>
        </section>

        {/* Formulário de Consulta */}
        {!appointment && (
          <div className="content-card mb-6">
            <form onSubmit={handleConsult} className="space-y-6">
              <div>
                <Input
                  type="text"
                  label="Token de Acesso"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Cole ou digite o token do seu agendamento"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  O token foi enviado por email quando você criou o agendamento
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Consultando...' : 'Consultar Agendamento'}
              </Button>
            </form>
          </div>
        )}

        {/* Resultado da Consulta */}
        {appointment && (
          <div className="content-card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-brand-darker"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Agendamento Encontrado
              </h2>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Data e Horário</p>
                <p className="text-lg text-gray-900">
                  {new Date(appointment.startTime).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-lg text-gray-900">
                  {new Date(appointment.startTime).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(appointment.endTime).toLocaleTimeString('pt-BR', {
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
                  className={`inline-block px-3 py-1 rounded text-sm font-medium mt-1 ${
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setAppointment(null);
                    setToken('');
                    setError('');
                  }}
                >
                  Nova Consulta
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/')}
                >
                  Voltar ao Início
                </Button>
              </div>
            </div>
          </div>
        )}
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

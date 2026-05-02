import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types/appointment';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ConsultAppointment() {
  const { t } = useTranslation('public');
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAppointment(null);

    if (!token.trim()) {
      setError(t('tokenRequired'));
      return;
    }

    try {
      setLoading(true);
      const data = await appointmentService.getAppointmentByPublicToken(token.trim());
      setAppointment(data);
    } catch (err: any) {
      setError(err.response?.data?.error || t('notFoundByToken'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!token || !appointment) return;

    try {
      await appointmentService.cancelPublicAppointment(token);
      const data = await appointmentService.getAppointmentByPublicToken(token);
      setAppointment(data);
      setConfirmingCancel(false);
    } catch (err: any) {
      setError(err.response?.data?.error || t('cancelError'));
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return t('confirmed');
      case 'PENDING':
        return t('pending');
      case 'CANCELLED':
        return t('cancelled');
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <section className="mb-8">
          <h1 className="page-title text-2xl md:text-3xl">{t('consultTitle')}</h1>
          <p className="text-gray-600 text-base mt-1">{t('consultSubtitle')}</p>
        </section>

        {!appointment && (
          <div className="content-card mb-6">
            <form onSubmit={handleConsult} className="space-y-6">
              <div>
                <Input
                  type="text"
                  label={t('consultTokenLabel')}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder={t('consultTokenPlaceholder')}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">{t('consultTokenHelp')}</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('consulting') : t('consultButton')}
              </Button>
            </form>
          </div>
        )}

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
                {t('appointmentFound')}
              </h2>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('dateTime')}</p>
                <p className="text-lg text-gray-900">
                  {new Date(appointment.startTime).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-lg text-gray-900">
                  {new Date(appointment.startTime).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(appointment.endTime).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {appointment.provider && (
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('professional')}</p>
                  <p className="text-lg text-gray-900">{appointment.provider.name}</p>
                  {appointment.provider.email && (
                    <p className="text-sm text-gray-600">{appointment.provider.email}</p>
                  )}
                </div>
              )}

              {appointment.clientName && (
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('client')}</p>
                  <p className="text-lg text-gray-900">{appointment.clientName}</p>
                  {appointment.clientEmail && (
                    <p className="text-sm text-gray-600">{appointment.clientEmail}</p>
                  )}
                </div>
              )}

              {appointment.title && (
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('titleLabel')}</p>
                  <p className="text-lg text-gray-900">{appointment.title}</p>
                </div>
              )}

              {appointment.description && (
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('descriptionLabel')}</p>
                  <p className="text-lg text-gray-900">{appointment.description}</p>
                </div>
              )}

              {appointment.location && (
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('locationLabel')}</p>
                  <p className="text-lg text-gray-900">{appointment.location}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500">{t('status')}</p>
                <span
                  className={`inline-block px-3 py-1 rounded text-sm font-medium mt-1 ${getStatusStyle(
                    appointment.status
                  )}`}
                >
                  {getStatusText(appointment.status)}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {appointment.status !== 'CANCELLED' && !confirmingCancel && (
                <Button variant="danger" onClick={() => setConfirmingCancel(true)} className="w-full">
                  {t('cancelAppointment')}
                </Button>
              )}
              {confirmingCancel && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 mb-3">{t('cancelConfirm')}</p>
                  <div className="flex gap-3">
                    <Button variant="danger" onClick={handleCancel}>
                      {t('cancelAppointment')}
                    </Button>
                    <Button variant="secondary" onClick={() => setConfirmingCancel(false)}>
                      {t('back')}
                    </Button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setAppointment(null);
                    setToken('');
                    setError('');
                    setConfirmingCancel(false);
                  }}
                >
                  {t('newConsult')}
                </Button>
                <Button variant="secondary" onClick={() => navigate('/')}>
                  {t('backToHome')}
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="mt-8 pt-6 text-left">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-base text-gray-600 hover:text-gray-900 underline py-1.5"
          >
            ← {t('backToHome')}
          </button>
        </div>
      </div>
    </div>
  );
}

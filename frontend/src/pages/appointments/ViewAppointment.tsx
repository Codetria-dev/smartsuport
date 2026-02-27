import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appointmentService } from '../../services/appointmentService';
import { Appointment, AppointmentStatus } from '../../types/appointment';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Card from '../../components/ui/Card';

export default function ViewAppointment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['appointments', 'clients', 'common']);
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (id) {
      loadAppointment();
    }
  }, [id]);

  const loadAppointment = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await appointmentService.getAppointmentById(id);
      setAppointment(data);
    } catch (err: any) {
      showError(err.response?.data?.error || t('appointments:loadAppointmentError'));
      navigate('/agenda');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!id) return;
    try {
      setConfirming(true);
      await appointmentService.confirmAppointment(id);
      success(t('appointments:confirmSuccess'));
      loadAppointment();
    } catch (err: any) {
      showError(err.response?.data?.error || t('appointments:confirmError'));
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    const reason = prompt(t('appointments:cancelPrompt'));
    if (reason === null) return;

    try {
      setCancelling(true);
      await appointmentService.cancelAppointment(id, reason || undefined);
      success(t('appointments:cancelSuccess'));
      loadAppointment();
    } catch (err: any) {
      showError(err.response?.data?.error || t('appointments:cancelError'));
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case AppointmentStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case AppointmentStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case AppointmentStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return t('appointments:pending');
      case AppointmentStatus.CONFIRMED:
        return t('appointments:confirmed');
      case AppointmentStatus.CANCELLED:
        return t('appointments:cancelled');
      case AppointmentStatus.COMPLETED:
        return t('appointments:completed');
      case AppointmentStatus.NO_SHOW:
        return t('appointments:noShow');
      default:
        return status;
    }
  };

  if (loading) {
    return <Loading fullScreen message={t('appointments:loadingAppointment')} />;
  }

  if (!appointment) {
    return (
      <div className="page-container max-w-4xl mx-auto">
        <Card>
          <p className="text-center text-gray-600">{t('appointments:notFound')}</p>
          <div className="mt-4 text-center">
            <Button onClick={() => navigate('/agenda')}>{t('appointments:back')}</Button>
          </div>
        </Card>
      </div>
    );
  }

  const startDate = new Date(appointment.startTime);
  const endDate = new Date(appointment.endTime);
  const role = user?.role != null ? String(user.role).toUpperCase() : '';
  const isProvider = role === 'PROVIDER' || role === 'ADMIN';
  const otherUser = isProvider ? appointment.client : appointment.provider;
  const hasClientInfo =
    isProvider &&
    (otherUser || appointment.clientName || appointment.clientEmail || appointment.clientPhone);
  const clientName = appointment.client?.name ?? appointment.clientName ?? null;
  const clientEmail = appointment.client?.email ?? appointment.clientEmail ?? null;
  const clientPhone = appointment.client?.phone ?? appointment.clientPhone ?? null;

  return (
    <div className="page-container max-w-4xl mx-auto">
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="page-title text-xl md:text-2xl mb-2">
              {appointment.title || t('appointments:appointment')}
            </h1>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                appointment.status
              )}`}
            >
              {getStatusLabel(appointment.status)}
            </span>
          </div>
          {appointment.status !== AppointmentStatus.CANCELLED &&
            appointment.status !== AppointmentStatus.COMPLETED && (
              <div className="flex gap-2">
                {!isProvider && (
                  <Button variant="secondary" onClick={() => navigate(`/appointments/${id}/edit`)}>
                    {t('common:edit')}
                  </Button>
                )}
                {isProvider && appointment.status === AppointmentStatus.PENDING && (
                  <Button
                    variant="secondary"
                    onClick={handleConfirm}
                    isLoading={confirming}
                  >
                    {t('common:confirm')}
                  </Button>
                )}
                <Button variant="danger" onClick={handleCancel} isLoading={cancelling}>
                  {t('common:cancel')}
                </Button>
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('appointments:appointmentInfo')}</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">{t('appointments:date')}</span>
                <p className="text-gray-900">
                  {startDate.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">{t('appointments:time')}</span>
                <p className="text-gray-900">
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
              <div>
                <span className="text-sm font-medium text-gray-500">{t('appointments:duration')}</span>
                <p className="text-gray-900">{t('appointments:durationValue', { count: appointment.duration })}</p>
              </div>
              {appointment.serviceType && (
                <div>
                  <span className="text-sm font-medium text-gray-500">{t('appointments:serviceType')}</span>
                  <p className="text-gray-900">{appointment.serviceType}</p>
                </div>
              )}
              {appointment.location && (
                <div>
                  <span className="text-sm font-medium text-gray-500">{t('appointments:location')}</span>
                  <p className="text-gray-900">{appointment.location}</p>
                </div>
              )}
              {appointment.meetingLink && (
                <div>
                  <span className="text-sm font-medium text-gray-500">{t('appointments:meetingLink')}</span>
                  <p className="text-blue-600">
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {appointment.meetingLink}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {isProvider ? t('appointments:clientInfo') : t('appointments:providerInfo')}
            </h2>
            {isProvider && hasClientInfo && (
              <div className="space-y-3">
                {(clientName || clientEmail) && (
                  <>
                    {clientName && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">{t('clients:name')}</span>
                        <p className="text-gray-900">{clientName}</p>
                      </div>
                    )}
                    {clientEmail && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">{t('clients:email')}</span>
                        <p className="text-gray-900">{clientEmail}</p>
                      </div>
                    )}
                    {clientPhone && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">{t('clients:phone')}</span>
                        <p className="text-gray-900">{clientPhone}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {!isProvider && otherUser && (
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">{t('clients:name')}</span>
                  <p className="text-gray-900">{otherUser.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">{t('clients:email')}</span>
                  <p className="text-gray-900">{otherUser.email}</p>
                </div>
                {otherUser.phone && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">{t('clients:phone')}</span>
                    <p className="text-gray-900">{otherUser.phone}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {appointment.description && (
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('appointments:description')}</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{appointment.description}</p>
          </div>
        )}

        {appointment.cancellationReason && (
          <div className="mt-6 pt-6 border-t">
            <h2 className="text-lg font-semibold text-red-900 mb-2">{t('appointments:cancellationReason')}</h2>
            <p className="text-red-700">{appointment.cancellationReason}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t text-sm text-gray-500">
          <p>
            {t('appointments:createdAt')}{' '}
            {new Date(appointment.createdAt).toLocaleString(undefined, {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </p>
          {appointment.updatedAt !== appointment.createdAt && (
            <p>
              {t('appointments:updatedAt')}{' '}
              {new Date(appointment.updatedAt).toLocaleString(undefined, {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </p>
          )}
        </div>
      </Card>
      <div className="mt-8 pt-6 text-left">
        <button
          type="button"
          onClick={() => navigate('/agenda')}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          ← {t('appointments:back')}
        </button>
      </div>
    </div>
  );
}

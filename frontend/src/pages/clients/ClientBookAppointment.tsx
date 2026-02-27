import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { clientService, ClientListItem } from '../../services/clientService';
import { appointmentService } from '../../services/appointmentService';
import { availabilityService } from '../../services/availabilityService';
import { TimeSlot } from '../../types/appointment';
import Loading from '../../components/ui/Loading';

const DURATION_OPTIONS = [30, 45, 60, 90, 120];

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent';

export default function ClientBookAppointment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('clients');
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [client, setClient] = useState<ClientListItem | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    clientService
      .getClient(id)
      .then(setClient)
      .catch((err: any) => {
        showError(err.response?.data?.error || t('clientNotFound'));
        navigate('/clients');
      })
      .finally(() => setLoadingClient(false));
  }, [id, navigate, showError, t]);

  useEffect(() => {
    if (!id || !user?.id || !selectedDate) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setSelectedTime('');
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);
    end.setDate(end.getDate() + 1);
    availabilityService
      .getAvailableSlots(user.id, start.toISOString(), end.toISOString())
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [id, user?.id, selectedDate]);

  const availableSlots = slots.filter((s) => s.available);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user?.id || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);
      await appointmentService.createAppointment({
        providerId: user.id,
        clientId: id,
        startTime: startTime.toISOString(),
        duration,
      });
      success(t('appointmentCreated'));
      navigate(`/clients/${id}`);
    } catch (err: any) {
      showError(err.response?.data?.error || t('createError'));
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loadingClient || !id) {
    return <Loading fullScreen message={t('loading')} />;
  }

  if (!client) return null;

  return (
    <div className="max-w-xl mx-auto mt-12 px-6">
      <Link
        to={`/clients/${id}`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 block"
      >
        {t('backToClient')}
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <h1 className="text-xl font-semibold text-gray-900">
          {t('scheduleTitle')}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {t('scheduleSubtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('date')}</label>
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('time')}</label>
              {loadingSlots ? (
                <p className="text-sm text-gray-500 mt-1">{t('loadingSlots')}</p>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-gray-500 mt-1">{t('noSlots')}</p>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {availableSlots.map((slot) => (
                    <button
                      key={`${slot.date}-${slot.time}`}
                      type="button"
                      onClick={() => setSelectedTime(slot.time)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        selectedTime === slot.time
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('duration')}</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className={inputClass}
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d} min
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={!selectedDate || !selectedTime || submitting}
              className="px-5 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t('saving') : t('createAppointment')}
            </button>
            <Link
              to={`/clients/${id}`}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

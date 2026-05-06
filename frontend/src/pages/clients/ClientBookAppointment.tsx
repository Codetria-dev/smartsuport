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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    marginTop: '4px',
    boxSizing: 'border-box',
    outline: 'none',
    background: '#fff',
    color: '#111827',
  };

  const btnPrimaryStyle: React.CSSProperties = {
    minHeight: '2.75rem',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '12px',
    background: '#d64e38',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s',
  };

  if (loadingClient || !id) {
    return <Loading fullScreen message={t('loading')} />;
  }

  if (!client) return null;

  return (
    <div style={{ maxWidth: '576px', margin: '48px auto 0', padding: '0 24px' }}>
      <Link
        to={`/clients/${id}`}
        style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none', display: 'block', marginBottom: '16px' }}
      >
        {t('backToClient')}
      </Link>

      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 24px -8px rgba(0,0,0,0.08)',
        border: '1px solid #f0ebe7',
        padding: '32px',
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>
          {t('scheduleTitle')}
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
          {t('scheduleSubtitle')}
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151' }}>{t('date')}</label>
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                ...inputStyle,
                borderColor: selectedDate ? '#d64e38' : '#e5e7eb',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#d64e38'; e.target.style.boxShadow = '0 0 0 3px rgba(214,78,56,0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              required
            />
          </div>

          {selectedDate && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151' }}>{t('time')}</label>
              {loadingSlots ? (
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{t('loadingSlots')}</p>
              ) : availableSlots.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{t('noSlots')}</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    return (
                      <button
                        key={`${slot.date}-${slot.time}`}
                        type="button"
                        onClick={() => setSelectedTime(slot.time)}
                        style={{
                          minHeight: '2.5rem',
                          padding: '8px 12px',
                          fontSize: '14px',
                          fontWeight: 500,
                          borderRadius: '12px',
                          border: isSelected ? '1px solid #d64e38' : '1px solid #e5e7eb',
                          background: isSelected ? '#d64e38' : '#fff',
                          color: isSelected ? '#fff' : '#374151',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.background = '#f9fafb'; } }}
                        onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.background = '#fff'; } }}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151' }}>{t('duration')}</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{
                ...inputStyle,
                cursor: 'pointer',
              }}
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d} min
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="submit"
              disabled={!selectedDate || !selectedTime || submitting}
              style={{
                ...btnPrimaryStyle,
                opacity: (!selectedDate || !selectedTime || submitting) ? 0.5 : 1,
                cursor: (!selectedDate || !selectedTime || submitting) ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => { if (selectedDate && selectedTime && !submitting) e.currentTarget.style.filter = 'brightness(0.9)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
            >
              {submitting ? t('saving') : t('createAppointment')}
            </button>
            <Link
              to={`/clients/${id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '2.75rem',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                color: '#374151',
                background: '#fff',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              {t('cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

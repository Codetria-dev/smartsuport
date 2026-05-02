import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { availabilityService } from '../../services/availabilityService';
import { TimeSlot } from '../../types/appointment';
import StepIndicator from '../../components/ui/StepIndicator';

export default function PublicBookAppointment() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('public');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  useEffect(() => {
    if (providerId) {
      loadSlots();
    }
  }, [providerId]);

  const loadSlots = async () => {
    if (!providerId) return;

    try {
      setLoading(true);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const data = await availabilityService.getAvailableSlots(
        providerId,
        startDate.toISOString(),
        endDate.toISOString()
      );
      setSlots(data);
    } catch (err: any) {
      setError(err.response?.data?.error || t('createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (date: string, time: string) => {
    navigate(`/book/${providerId}/dados`, { state: { date, time } });
  };

  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    if (slot.available) {
      acc[slot.date].push(slot);
    }
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const availableDates = Object.keys(slotsByDate).sort();

  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #fef6f2, #f9fafb)',
  };

  const containerStyle = {
    maxWidth: '896px',
    margin: '0 auto',
    padding: '40px 24px',
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #f0ebe7',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 24px -8px rgba(0,0,0,0.08)',
    padding: '32px',
  };

  if (loading) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #d64e38',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ fontSize: '16px', color: '#6b7280', fontWeight: 500, margin: 0 }}>
            {t('loadingSlots')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ marginBottom: '40px' }}>
          <StepIndicator
            currentStep={1}
            steps={[t('stepProfessional'), t('stepDateTime'), t('stepYourData')]}
          />
        </div>

        <section style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
            {t('bookTitle')}
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '4px' }}>
            {t('clickToContinue')}
          </p>
        </section>

        {error && (
          <div style={{
            marginBottom: '32px',
            padding: '16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '12px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {availableDates.length === 0 ? (
          <div style={{ ...cardStyle, padding: '40px', textAlign: 'center', maxWidth: '512px', margin: '0 auto' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'rgba(214,78,56,0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d64e38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
              {t('noSlotsAvailable')}
            </p>
          </div>
        ) : (
          <div style={{ ...cardStyle, padding: '24px 32px' }}>
            <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '8px' }}>
              {availableDates.map((date) => {
                const dateObj = new Date(date);
                const dateStr = dateObj.toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });

                return (
                  <div key={date} style={{
                    borderBottom: '1px solid #f3f4f6',
                    paddingBottom: '20px',
                    marginBottom: '20px',
                  }}>
                    <h3 style={{
                      fontWeight: 600,
                      color: '#111827',
                      marginBottom: '12px',
                      textTransform: 'capitalize',
                      fontSize: '16px',
                      margin: '0 0 12px 0',
                    }}>
                      {dateStr}
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '10px',
                    }}>
                      {slotsByDate[date].map((slot) => {
                        const slotKey = `${slot.date}-${slot.time}`;
                        const isHovered = hoveredSlot === slotKey;
                        return (
                          <button
                            key={slotKey}
                            onClick={() => handleSlotSelect(slot.date, slot.time)}
                            style={{
                              minHeight: '44px',
                              padding: '10px 12px',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: 500,
                              border: isHovered ? '1.5px solid #d64e38' : '1.5px solid #e5e7eb',
                              background: isHovered ? '#d64e38' : '#f9fafb',
                              color: isHovered ? '#fff' : '#374151',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              transform: isHovered ? 'scale(0.97)' : 'scale(1)',
                            }}
                            onMouseEnter={() => setHoveredSlot(slotKey)}
                            onMouseLeave={() => setHoveredSlot(null)}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rodapé — Voltar */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #f0ebe7', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/select-provider')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: 500,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#d64e38')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('back')}
          </button>
        </div>
      </div>
    </div>
  );
}

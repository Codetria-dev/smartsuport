import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { availabilityService } from '../../services/availabilityService';
import { Availability, TimeSlot } from '../../types/appointment';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import Loading from '../../components/ui/Loading';

const DAY_KEYS = ['day0', 'day1', 'day2', 'day3', 'day4', 'day5', 'day6'] as const;

function groupAvailabilitiesBySlot(availabilities: Availability[]) {
  const key = (a: Availability) => `${a.dayOfWeek}-${a.startTime}-${a.endTime}`;
  const map = new Map<string, Availability[]>();
  for (const a of availabilities) {
    const k = key(a);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(a);
  }
  return Array.from(map.entries()).map(([_, items]) => items);
}

export default function ManageAvailability() {
  const { t } = useTranslation(['availability', 'common']);
  const { success, error: showError } = useToast();
  const { user } = useAuth();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showSlots, setShowSlots] = useState(false);
  const [daysToShow, setDaysToShow] = useState(7);

  const {
    values,
    errors,
    getFieldProps,
    validateForm,
    setFieldValue,
    resetForm,
  } = useFormValidation(
    {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '18:00',
      isRecurring: true,
      slotDuration: 30,
      bufferTime: 10,
      maxBookingsPerSlot: 1,
      isActive: true,
    },
    {
      dayOfWeek: { required: true },
      startTime: { required: true },
      endTime: {
        required: true,
        custom: (value, allValues) => {
          if (value && allValues?.startTime) {
            const start =
              parseInt(String(allValues.startTime).split(':')[0]) * 60 +
              parseInt(String(allValues.startTime).split(':')[1]);
            const end =
              parseInt(value.split(':')[0]) * 60 + parseInt(value.split(':')[1]);
            if (end <= start) {
              return t('availability:endTimeAfterStart');
            }
          }
          return null;
        },
      },
      slotDuration: { required: true, min: 5, max: 480 },
      bufferTime: { required: true, min: 0, max: 60 },
      maxBookingsPerSlot: { required: true, min: 1 },
    }
  );

  const daysOfWeek = useMemo(
    () => DAY_KEYS.map((key, i) => ({ value: i, label: t(`availability:${key}`) })),
    [t]
  );

  const grouped = useMemo(
    () => groupAvailabilitiesBySlot(availabilities),
    [availabilities]
  );

  useEffect(() => {
    loadAvailabilities();
  }, []);

  useEffect(() => {
    if (showSlots && user?.id) {
      loadAvailableSlots();
    }
  }, [showSlots, daysToShow]);

  const loadAvailabilities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await availabilityService.getMyAvailabilities();
      setAvailabilities(data);
    } catch (err: any) {
      showError(err.response?.data?.error || t('availability:loadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showError(t('availability:fixFormErrors'));
      return;
    }
    try {
      await availabilityService.createAvailability(values);
      success(t('availability:createSuccess'));
      setShowForm(false);
      resetForm();
      await loadAvailabilities();
      if (showSlots) await loadAvailableSlots();
    } catch (err: any) {
      showError(err.response?.data?.error || t('availability:createError'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('availability:deleteConfirm'))) return;
    try {
      setDeletingId(id);
      await availabilityService.deleteAvailability(id);
      success(t('availability:deleteSuccess'));
      await loadAvailabilities();
      if (showSlots) await loadAvailableSlots();
    } catch (err: any) {
      showError(err.response?.data?.error || t('availability:deleteError'));
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (availability: Availability) => {
    try {
      setTogglingId(availability.id);
      await availabilityService.updateAvailability(availability.id, {
        isActive: !availability.isActive,
      });
      success(
        t('availability:toggleSuccess', {
          status: !availability.isActive ? t('availability:toggleActivated') : t('availability:toggleDeactivated'),
        })
      );
      await loadAvailabilities();
      if (showSlots) await loadAvailableSlots();
    } catch (err: any) {
      showError(err.response?.data?.error || t('availability:updateError'));
    } finally {
      setTogglingId(null);
    }
  };

  const startEdit = (availability: Availability) => {
    setEditingId(availability.id);
    setFieldValue('dayOfWeek', availability.dayOfWeek);
    setFieldValue('startTime', availability.startTime);
    setFieldValue('endTime', availability.endTime);
    setFieldValue('isRecurring', availability.isRecurring);
    setFieldValue('slotDuration', availability.slotDuration);
    setFieldValue('bufferTime', availability.bufferTime);
    setFieldValue('maxBookingsPerSlot', availability.maxBookingsPerSlot);
    setFieldValue('isActive', availability.isActive);
    if (availability.startDate) setFieldValue('startDate', availability.startDate);
    if (availability.endDate) setFieldValue('endDate', availability.endDate);
  };

  const handleUpdate = async (id: string) => {
    if (!validateForm()) {
      showError(t('availability:fixFormErrors'));
      return;
    }
    try {
      await availabilityService.updateAvailability(id, values);
      success(t('availability:updateSuccess'));
      setEditingId(null);
      resetForm();
      await loadAvailabilities();
      if (showSlots) await loadAvailableSlots();
    } catch (err: any) {
      showError(err.response?.data?.error || t('availability:updateError'));
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const loadAvailableSlots = async () => {
    if (!user?.id) return;
    try {
      setLoadingSlots(true);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysToShow);
      const slots = await availabilityService.getAvailableSlots(
        user.id,
        startDate.toISOString(),
        endDate.toISOString()
      );
      setAvailableSlots(slots);
    } catch (err: any) {
      showError(
        err.response?.data?.error || t('availability:loadSlotsError')
      );
    } finally {
      setLoadingSlots(false);
    }
  };

  const slotsByDate = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);
  const availableDates = Object.keys(slotsByDate).sort();

  if (loading) {
    return <Loading fullScreen message={t('availability:loadingAvailability')} />;
  }

  const selectStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: '#fff',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const inputLabelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '4px',
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #f0ebe7',
    padding: '24px',
    marginBottom: '40px',
  };

  const btnPrimaryStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '44px',
    padding: '10px 24px',
    borderRadius: '10px',
    backgroundColor: '#d64e38',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  const btnSecondaryStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '44px',
    padding: '10px 24px',
    borderRadius: '10px',
    backgroundColor: '#fff',
    color: '#374151',
    fontSize: '15px',
    fontWeight: 500,
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  const btnSmallStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '40px',
    padding: '8px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', background: 'linear-gradient(180deg, #fef6f2 0%, #f9fafb 100%)', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '1024px', margin: '0 auto' }}>

        {/* ===== 1. HEADER ===== */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(214, 78, 56, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg style={{ width: '24px', height: '24px', color: '#d64e38' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', letterSpacing: '-0.025em', margin: 0 }}>
                {t('availability:manageAvailability')}
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                {t('availability:manageSubtitle')}
              </p>
            </div>
          </div>
          {!showForm && !editingId && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              style={btnPrimaryStyle}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
            >
              {t('availability:newAvailability')}
            </button>
          )}
        </div>

        {/* ===== 2. FORM: New Availability ===== */}
        {showForm && (
          <div style={{ ...cardStyle }} key="new-form">
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: '0 0 16px 0' }}>
              {t('availability:newAvailability')}
            </h2>
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={inputLabelStyle}>{t('availability:weekday')}</label>
                  <select
                    {...(getFieldProps('dayOfWeek') as unknown as React.SelectHTMLAttributes<HTMLSelectElement>)}
                    style={{ ...selectStyle, borderColor: errors.dayOfWeek ? '#ef4444' : '#d1d5db' }}
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                  {errors.dayOfWeek && <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#dc2626' }}>{errors.dayOfWeek}</p>}
                </div>
                <div>
                  <label style={inputLabelStyle}>{t('availability:recurring')}</label>
                  <select
                    value={values.isRecurring ? 'true' : 'false'}
                    onChange={(e) => setFieldValue('isRecurring', e.target.value === 'true')}
                    style={selectStyle}
                  >
                    <option value="true">{t('availability:recurringWeekly')}</option>
                    <option value="false">{t('availability:recurringSpecific')}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={inputLabelStyle}>{t('availability:startTime')}</label>
                  <input
                    type="time"
                    {...getFieldProps('startTime')}
                    style={{ ...selectStyle, padding: '10px 12px', fontSize: '15px' }}
                  />
                </div>
                <div>
                  <label style={inputLabelStyle}>{t('availability:endTime')}</label>
                  <input
                    type="time"
                    {...getFieldProps('endTime')}
                    style={{ ...selectStyle, padding: '10px 12px', fontSize: '15px' }}
                  />
                </div>
              </div>

              {!values.isRecurring && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                  <div>
                    <label style={inputLabelStyle}>{t('availability:startDate')}</label>
                    <input
                      type="date"
                      {...getFieldProps('startDate')}
                      style={{ ...selectStyle, padding: '10px 12px', fontSize: '15px' }}
                    />
                  </div>
                  <div>
                    <label style={inputLabelStyle}>{t('availability:endDate')}</label>
                    <input
                      type="date"
                      {...getFieldProps('endDate')}
                      style={{ ...selectStyle, padding: '10px 12px', fontSize: '15px' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={inputLabelStyle}>{t('availability:slotDuration')}</label>
                  <input
                    type="number"
                    {...getFieldProps('slotDuration')}
                    min={5}
                    max={480}
                    style={{ ...selectStyle, padding: '10px 12px', fontSize: '15px' }}
                  />
                </div>
                <div>
                  <label style={inputLabelStyle}>{t('availability:buffer')}</label>
                  <input
                    type="number"
                    {...getFieldProps('bufferTime')}
                    min={0}
                    max={60}
                    style={{ ...selectStyle, padding: '10px 12px', fontSize: '15px' }}
                  />
                </div>
                <div>
                  <label style={inputLabelStyle}>{t('availability:maxBookingsPerSlot')}</label>
                  <input
                    type="number"
                    {...getFieldProps('maxBookingsPerSlot')}
                    min={1}
                    style={{ ...selectStyle, padding: '10px 12px', fontSize: '15px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" style={{ ...btnPrimaryStyle, flex: 1 }}> {t('availability:createAvailability')} </button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={{ ...btnSecondaryStyle, flex: 1 }}>
                  {t('availability:cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===== 3. CARD: Available Slots ===== */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: '0 0 16px 0' }}>
            {t('availability:availableSlotsTitle')}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <select
              value={daysToShow}
              onChange={(e) => setDaysToShow(parseInt(e.target.value))}
              disabled={!showSlots}
              style={{ ...selectStyle, width: 'auto', opacity: !showSlots ? 0.5 : 1 }}
            >
              <option value={7}>{t('availability:daysCount', { count: 7 })}</option>
              <option value={14}>{t('availability:daysCount', { count: 14 })}</option>
              <option value={30}>{t('availability:daysCount', { count: 30 })}</option>
            </select>
            <button
              type="button"
              onClick={() => { setShowSlots(!showSlots); if (!showSlots && user?.id) loadAvailableSlots(); }}
              style={btnPrimaryStyle}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
            >
              {showSlots ? t('availability:hideSlots') : t('availability:viewAgenda')}
            </button>
          </div>

          {showSlots && (
            <div style={{ marginTop: '16px' }}>
              {loadingSlots ? (
                <div style={{ padding: '32px 0' }}><Loading message={t('availability:loadingSlots')} /></div>
              ) : availableDates.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px', padding: '24px 0', margin: 0 }}>
                  {t('availability:noSlotsConfigure')}
                </p>
              ) : (
                <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {availableDates.map((date) => {
                    const dateObj = new Date(date);
                    const dateStr = dateObj.toLocaleDateString('pt-BR', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    });
                    const slots = slotsByDate[date].filter((s) => s.available);
                    return (
                      <div key={date} style={{ border: '1px solid #f0ebe7', borderRadius: '8px', padding: '12px', backgroundColor: 'rgba(214, 78, 56, 0.05)' }}>
                        <p style={{ fontWeight: 500, color: '#111827', fontSize: '14px', margin: 0, textTransform: 'capitalize' }}>{dateStr}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                          {slots.length > 0 ? slots.map((slot) => (
                            <span key={`${slot.date}-${slot.time}`} style={{ padding: '4px 8px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px', fontSize: '12px', fontWeight: 500 }}>
                              {slot.time}
                            </span>
                          )) : (
                            <span style={{ color: '#6b7280', fontSize: '12px' }}>{t('availability:noSlotsThisDay')}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== 4. CARD: Configured Availabilities ===== */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: '0 0 16px 0' }}>
            {t('availability:configuredTitle')}
          </h2>
          {availabilities.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px', padding: '32px 0', textAlign: 'center', margin: 0 }}>
              {t('availability:noAvailability')}
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {grouped.map((group) => {
                const first = group[0];
                const dayLabel = t(`availability:${DAY_KEYS[first.dayOfWeek]}`);
                return (
                  <div key={`${first.dayOfWeek}-${first.startTime}-${first.endTime}`} style={{ backgroundColor: 'rgba(214, 78, 56, 0.05)', borderRadius: '8px', padding: '16px', border: '1px solid #f0ebe7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                      <div>
                        <p style={{ fontWeight: 500, color: '#111827', margin: 0 }}>{dayLabel}</p>
                        <p style={{ fontSize: '14px', color: '#4b5563', margin: '2px 0 0 0' }}>
                          {first.startTime} – {first.endTime}
                        </p>
                        {group.length > 1 && (
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                            {t('availability:configurationsCount', { count: group.length })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {group.map((availability, idx) => (
                        <div key={availability.id} style={editingId === availability.id ? { borderRadius: '8px', padding: '16px', backgroundColor: '#fff', border: '2px solid #111827' } : idx > 0 ? { paddingTop: '12px', borderTop: '1px solid #d1d5db' } : {}}>
                          {editingId === availability.id ? (
                            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(availability.id); }} noValidate>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                  <label style={inputLabelStyle}>{t('availability:dayOfWeek')}</label>
                                  <select {...(getFieldProps('dayOfWeek') as unknown as React.SelectHTMLAttributes<HTMLSelectElement>)} style={{ ...selectStyle, borderColor: errors.dayOfWeek ? '#ef4444' : '#d1d5db' }}>
                                    {daysOfWeek.map((day) => (<option key={day.value} value={day.value}>{day.label}</option>))}
                                  </select>
                                </div>
                                <div>
                                  <label style={inputLabelStyle}>{t('availability:recurring')}</label>
                                  <select value={values.isRecurring ? 'true' : 'false'} onChange={(e) => setFieldValue('isRecurring', e.target.value === 'true')} style={selectStyle}>
                                    <option value="true">{t('availability:weekly')}</option>
                                    <option value="false">{t('availability:specificDates')}</option>
                                  </select>
                                </div>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                <div>
                                  <label style={inputLabelStyle}>{t('availability:startTimeShort')}</label>
                                  <input type="time" {...getFieldProps('startTime')} style={{ ...selectStyle, padding: '10px 12px' }} />
                                </div>
                                <div>
                                  <label style={inputLabelStyle}>{t('availability:endTimeShort')}</label>
                                  <input type="time" {...getFieldProps('endTime')} style={{ ...selectStyle, padding: '10px 12px' }} />
                                </div>
                              </div>
                              {!values.isRecurring && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                  <div>
                                    <label style={inputLabelStyle}>{t('availability:startDateShort')}</label>
                                    <input type="date" {...getFieldProps('startDate')} style={{ ...selectStyle, padding: '10px 12px' }} />
                                  </div>
                                  <div>
                                    <label style={inputLabelStyle}>{t('availability:endDateShort')}</label>
                                    <input type="date" {...getFieldProps('endDate')} style={{ ...selectStyle, padding: '10px 12px' }} />
                                  </div>
                                </div>
                              )}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '12px' }}>
                                <div>
                                  <label style={inputLabelStyle}>{t('availability:slotDurationShort')}</label>
                                  <input type="number" {...getFieldProps('slotDuration')} min={5} max={480} style={{ ...selectStyle, padding: '10px 12px' }} />
                                </div>
                                <div>
                                  <label style={inputLabelStyle}>{t('availability:bufferShort')}</label>
                                  <input type="number" {...getFieldProps('bufferTime')} min={0} max={60} style={{ ...selectStyle, padding: '10px 12px' }} />
                                </div>
                                <div>
                                  <label style={inputLabelStyle}>{t('availability:maxPerSlotShort')}</label>
                                  <input type="number" {...getFieldProps('maxBookingsPerSlot')} min={1} style={{ ...selectStyle, padding: '10px 12px' }} />
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button type="submit" style={{ ...btnSmallStyle, flex: 1, backgroundColor: '#d64e38', color: '#fff' }}>{t('availability:save')}</button>
                                <button type="button" onClick={cancelEdit} style={{ ...btnSmallStyle, flex: 1, border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151' }}>{t('availability:cancel')}</button>
                              </div>
                            </form>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                              <div style={{ fontSize: '14px', color: '#4b5563' }}>
                                <span>
                                  {t('availability:slotBufferInfo', { slot: availability.slotDuration, buffer: availability.bufferTime })}
                                </span>
                                <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, backgroundColor: availability.isActive ? '#dcfce7' : '#e5e7eb', color: availability.isActive ? '#166534' : '#374151' }}>
                                  {availability.isActive ? t('availability:active') : t('availability:inactive')}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="button" onClick={() => startEdit(availability)}
                                  style={{ ...btnSmallStyle, border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151' }}>{t('availability:edit')}</button>
                                <button type="button" onClick={() => toggleActive(availability)} disabled={togglingId === availability.id}
                                  style={{ ...btnSmallStyle, backgroundColor: '#fef9c3', color: '#a16207', border: '1px solid #facc15' }}>{availability.isActive ? t('availability:deactivate') : t('availability:activate')}</button>
                                <button type="button" onClick={() => handleDelete(availability.id)} disabled={deletingId === availability.id}
                                  style={{ ...btnSmallStyle, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' }}>{deletingId === availability.id ? t('availability:deleting') : t('availability:delete')}</button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

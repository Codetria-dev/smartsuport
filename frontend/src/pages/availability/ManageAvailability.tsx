import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { availabilityService } from '../../services/availabilityService';
import { Availability, TimeSlot } from '../../types/appointment';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
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

  const loadAvailabilities = async () => {
    try {
      setLoading(true);
      const data = await availabilityService.getMyAvailabilities();
      setAvailabilities(data);
    } catch (err: any) {
      showError(err.response?.data?.error || t('availability:loadError'));
    } finally {
      setLoading(false);
    }
  };

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

  const selectClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent';

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {t('availability:manageAvailability')}
          </h1>
          <p className="text-gray-500 text-sm mb-6 sm:mb-0">
            {t('availability:manageSubtitle')}
          </p>
        </div>
        {!showForm && !editingId && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="shrink-0 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            {t('availability:newAvailability')}
          </button>
        )}
      </div>

      {/* Form Nova Disponibilidade */}
      {showForm && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('availability:newAvailability')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('availability:weekday')}
                </label>
                <select
                  {...(getFieldProps('dayOfWeek') as unknown as React.SelectHTMLAttributes<HTMLSelectElement>)}
                  className={`${selectClass} ${errors.dayOfWeek ? 'border-red-500' : ''}`}
                >
                  {daysOfWeek.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                {errors.dayOfWeek && (
                  <p className="mt-1 text-sm text-red-600">{errors.dayOfWeek}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('availability:recurring')}
                </label>
                <select
                  value={values.isRecurring ? 'true' : 'false'}
                  onChange={(e) =>
                    setFieldValue('isRecurring', e.target.value === 'true')
                  }
                  className={selectClass}
                >
                  <option value="true">{t('availability:recurringWeekly')}</option>
                  <option value="false">{t('availability:recurringSpecific')}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="time"
                {...getFieldProps('startTime')}
                label={t('availability:startTime')}
              />
              <Input
                type="time"
                {...getFieldProps('endTime')}
                label={t('availability:endTime')}
              />
            </div>
            {!values.isRecurring && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="date"
                  {...getFieldProps('startDate')}
                  label={t('availability:startDate')}
                />
                <Input
                  type="date"
                  {...getFieldProps('endDate')}
                  label={t('availability:endDate')}
                />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                type="number"
                {...getFieldProps('slotDuration')}
                label={t('availability:slotDuration')}
                min={5}
                max={480}
              />
              <Input
                type="number"
                {...getFieldProps('bufferTime')}
                label={t('availability:buffer')}
                min={0}
                max={60}
              />
              <Input
                type="number"
                {...getFieldProps('maxBookingsPerSlot')}
                label={t('availability:maxBookingsPerSlot')}
                min={1}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">
                {t('availability:createAvailability')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex-1"
              >
                {t('availability:cancel')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Card Ver Horários Disponíveis */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('availability:availableSlotsTitle')}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={daysToShow}
            onChange={(e) => setDaysToShow(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            disabled={!showSlots}
          >
            <option value={7}>{t('availability:daysCount', { count: 7 })}</option>
            <option value={14}>{t('availability:daysCount', { count: 14 })}</option>
            <option value={30}>{t('availability:daysCount', { count: 30 })}</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setShowSlots(!showSlots);
              if (!showSlots && user?.id) loadAvailableSlots();
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            {showSlots ? t('availability:hideSlots') : t('availability:viewAgenda')}
          </button>
        </div>

        {showSlots && (
          <div className="mt-4">
            {loadingSlots ? (
              <div className="py-8">
                <Loading message={t('availability:loadingSlots')} />
              </div>
            ) : availableDates.length === 0 ? (
              <p className="text-gray-500 text-sm py-6">
                {t('availability:noSlotsConfigure')}
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {availableDates.map((date) => {
                  const dateObj = new Date(date);
                  const dateStr = dateObj.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  });
                  const slots = slotsByDate[date].filter((s) => s.available);
                  return (
                    <div
                      key={date}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                    >
                      <p className="font-medium text-gray-900 text-sm capitalize">
                        {dateStr}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {slots.length > 0 ? (
                          slots.map((slot) => (
                            <span
                              key={`${slot.date}-${slot.time}`}
                              className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                            >
                              {slot.time}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-xs">
                            {t('availability:noSlotsThisDay')}
                          </span>
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

      {/* 3. Card Disponibilidades Configuradas */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('availability:configuredTitle')}
        </h2>
        {availabilities.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">
            {t('availability:noAvailability')}
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {grouped.map((group) => {
              const first = group[0];
              const dayLabel = t(`availability:${DAY_KEYS[first.dayOfWeek]}`);
              return (
                <div
                  key={`${first.dayOfWeek}-${first.startTime}-${first.endTime}`}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{dayLabel}</p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {first.startTime} – {first.endTime}
                      </p>
                      {group.length > 1 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {t('availability:configurationsCount', { count: group.length })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {group.map((availability, idx) => (
                      <div
                        key={availability.id}
                        className={
                          editingId === availability.id
                            ? 'rounded-lg p-4 bg-white border-2 border-gray-900'
                            : idx > 0
                              ? 'pt-3 border-t border-gray-200'
                              : ''
                        }
                      >
                        {editingId === availability.id ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleUpdate(availability.id);
                            }}
                            className="space-y-3"
                          >
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  {t('availability:dayOfWeek')}
                                </label>
                                <select
                                  {...(getFieldProps('dayOfWeek') as unknown as React.SelectHTMLAttributes<HTMLSelectElement>)}
                                  className={`${selectClass} ${errors.dayOfWeek ? 'border-red-500' : ''}`}
                                >
                                  {daysOfWeek.map((day) => (
                                    <option key={day.value} value={day.value}>
                                      {day.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  {t('availability:recurring')}
                                </label>
                                <select
                                  value={values.isRecurring ? 'true' : 'false'}
                                  onChange={(e) =>
                                    setFieldValue(
                                      'isRecurring',
                                      e.target.value === 'true'
                                    )
                                  }
                                  className={selectClass}
                                >
                                  <option value="true">{t('availability:weekly')}</option>
                                  <option value="false">{t('availability:specificDates')}</option>
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                type="time"
                                {...getFieldProps('startTime')}
                                label={t('availability:startTimeShort')}
                              />
                              <Input
                                type="time"
                                {...getFieldProps('endTime')}
                                label={t('availability:endTimeShort')}
                              />
                            </div>
                            {!values.isRecurring && (
                              <div className="grid grid-cols-2 gap-3">
                                <Input
                                  type="date"
                                  {...getFieldProps('startDate')}
                                  label={t('availability:startDateShort')}
                                />
                                <Input
                                  type="date"
                                  {...getFieldProps('endDate')}
                                  label={t('availability:endDateShort')}
                                />
                              </div>
                            )}
                            <div className="grid grid-cols-3 gap-2">
                              <Input
                                type="number"
                                {...getFieldProps('slotDuration')}
                                label={t('availability:slotDurationShort')}
                                min={5}
                                max={480}
                              />
                              <Input
                                type="number"
                                {...getFieldProps('bufferTime')}
                                label={t('availability:bufferShort')}
                                min={0}
                                max={60}
                              />
                              <Input
                                type="number"
                                {...getFieldProps('maxBookingsPerSlot')}
                                label={t('availability:maxPerSlotShort')}
                                min={1}
                              />
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                type="submit"
                                className="flex-1 px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
                              >
                                {t('availability:save')}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-100"
                              >
                                {t('availability:cancel')}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="text-sm text-gray-600">
                              <span>
                                {t('availability:slotBufferInfo', {
                                  slot: availability.slotDuration,
                                  buffer: availability.bufferTime,
                                })}
                              </span>
                              <span
                                className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                                  availability.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {availability.isActive ? t('availability:active') : t('availability:inactive')}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(availability)}
                                className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300 transition-colors"
                              >
                                {t('availability:edit')}
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleActive(availability)}
                                disabled={togglingId === availability.id}
                                className="px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-800 text-sm font-medium hover:bg-yellow-200 transition-colors disabled:opacity-50"
                              >
                                {availability.isActive ? t('availability:deactivate') : t('availability:activate')}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(availability.id)}
                                disabled={deletingId === availability.id}
                                className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                              >
                                {deletingId === availability.id
                                  ? t('availability:deleting')
                                  : t('availability:delete')}
                              </button>
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
  );
}

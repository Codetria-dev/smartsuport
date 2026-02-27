import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appointmentService } from '../../services/appointmentService';
import { availabilityService } from '../../services/availabilityService';
import { Appointment, CreateAppointmentInput, TimeSlot } from '../../types/appointment';
import { useToast } from '../../contexts/ToastContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';
import Card from '../../components/ui/Card';
import TimeSlotComponent from '../../components/agendamento/TimeSlot';

export default function EditAppointment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['appointments', 'common']);
  const { user } = useAuth();
  const role = user?.role != null ? String(user.role).toUpperCase() : '';
  const isProvider = role === 'PROVIDER' || role === 'ADMIN';
  const { success, error: showError } = useToast();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const {
    values,
    errors,
    getFieldProps,
    validateForm,
    setFieldValue,
    handleChange,
    handleBlur,
  } = useFormValidation(
    {
      title: '',
      description: '',
      location: '',
      meetingLink: '',
      startTime: '',
      duration: 30,
    },
    {
      title: { maxLength: 200 },
      description: { maxLength: 1000 },
      location: { maxLength: 200 },
      meetingLink: { url: true },
      duration: { required: true, min: 5, max: 480 },
    }
  );

  // Profissional não pode editar agendamento (apenas confirmar/cancelar)
  useEffect(() => {
    if (user && isProvider) {
      navigate('/agenda', { replace: true });
      return;
    }
  }, [user, isProvider, navigate]);

  useEffect(() => {
    if (id && !isProvider) {
      loadAppointment();
    }
  }, [id, isProvider]);

  useEffect(() => {
    if (appointment && appointment.providerId && values.startTime) {
      loadTimeSlots();
    }
  }, [values.startTime, appointment?.providerId]);

  const loadAppointment = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await appointmentService.getAppointmentById(id);
      setAppointment(data);
      
      // Preenche o formulário com os dados existentes
      const startDate = new Date(data.startTime);
      const dateStr = startDate.toISOString().split('T')[0];
      const timeStr = startDate.toTimeString().slice(0, 5);
      
      setFieldValue('title', data.title || '');
      setFieldValue('description', data.description || '');
      setFieldValue('location', data.location || '');
      setFieldValue('meetingLink', data.meetingLink || '');
      setFieldValue('duration', data.duration);
      setFieldValue('startTime', `${dateStr}T${timeStr}`);
    } catch (err: any) {
      showError(err.response?.data?.error || t('appointments:loadAppointmentError'));
      navigate('/agenda');
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async () => {
    if (!appointment?.providerId || !values.startTime) return;
    
    try {
      setLoadingSlots(true);
      const date = new Date(values.startTime);
      const endDate = new Date(date.getTime() + values.duration * 60000);
      const slots = await availabilityService.getAvailableSlots(
        appointment.providerId,
        date.toISOString(),
        endDate.toISOString()
      );
      setTimeSlots(slots);
    } catch (err: any) {
      console.error(t('appointments:loadAppointmentError'), err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id || !appointment) {
      showError(t('appointments:fixErrors'));
      return;
    }

    // Validação adicional: não permitir agendar no passado
    const [dateStr, timeStr] = values.startTime.split('T');
    const startTime = new Date(`${dateStr}T${timeStr}`);
    if (startTime < new Date()) {
      showError(t('appointments:noPast'));
      return;
    }

    try {
      setSaving(true);
      const updateData: Partial<CreateAppointmentInput> = {
        startTime: startTime.toISOString(),
        duration: values.duration,
        title: values.title || undefined,
        description: values.description || undefined,
        location: values.location || undefined,
        meetingLink: values.meetingLink || undefined,
      };

      await appointmentService.updateAppointment(id, updateData);
      success(t('appointments:updateSuccess'));
      navigate(`/appointments/${id}`);
    } catch (err: any) {
      showError(err.response?.data?.error || t('appointments:updateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    const [dateStr] = values.startTime.split('T');
    setFieldValue('startTime', `${dateStr}T${time}`);
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

  const selectedDate = values.startTime ? values.startTime.split('T')[0] : '';
  const selectedTime = values.startTime ? values.startTime.split('T')[1] : '';

  return (
    <div className="page-container max-w-4xl mx-auto">
      <Card className="p-6">
        <h1 className="page-title mb-6">{t('appointments:editTitle')}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              {...getFieldProps('title')}
              label={t('appointments:title')}
              placeholder={t('appointments:titlePlaceholder')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('appointments:durationMinutes')}
              </label>
              <select
                value={values.duration}
                onChange={(e) => setFieldValue('duration', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>{t('appointments:durationValue', { count: 15 })}</option>
                <option value={30}>{t('appointments:durationValue', { count: 30 })}</option>
                <option value={45}>{t('appointments:durationValue', { count: 45 })}</option>
                <option value={60}>{t('appointments:durationValue', { count: 60 })}</option>
                <option value={90}>{t('appointments:durationValue', { count: 90 })}</option>
                <option value={120}>{t('appointments:durationValue', { count: 120 })}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('appointments:dateTime')}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  const time = values.startTime.split('T')[1] || '09:00';
                  setFieldValue('startTime', `${newDate}T${time}`);
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {loadingSlots ? (
                <div className="text-center py-4 text-gray-500">{t('appointments:loadingSlots')}</div>
              ) : timeSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots
                    .filter((slot) => slot.date === selectedDate)
                    .map((slot) => (
                      <TimeSlotComponent
                        key={slot.time}
                        time={slot.time}
                        available={slot.available}
                        selected={selectedTime === slot.time}
                        onClick={() => handleTimeSelect(slot.time)}
                      />
                    ))}
                </div>
              ) : (
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => {
                    const date = values.startTime.split('T')[0] || new Date().toISOString().split('T')[0];
                    setFieldValue('startTime', `${date}T${e.target.value}`);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              )}
            </div>
          </div>

          <Input
            {...getFieldProps('location')}
            label={t('appointments:location')}
            placeholder={t('appointments:locationPlaceholder')}
          />

          <Input
            {...getFieldProps('meetingLink')}
            label={t('appointments:meetingLink')}
            placeholder={t('appointments:meetingLinkPlaceholder')}
            type="url"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('appointments:description')}
            </label>
            <textarea
              value={values.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              rows={4}
              placeholder={t('appointments:descriptionPlaceholder')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/appointments/${id}`)}
            >
              {t('common:cancel')}
            </Button>
            <Button type="submit" isLoading={saving}>
              {t('appointments:saveChanges')}
            </Button>
          </div>
        </form>
      </Card>
      <div className="mt-8 pt-6 text-left">
        <button
          type="button"
          onClick={() => navigate(`/appointments/${id}`)}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          ← {t('appointments:back')}
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { availabilityService, appointmentService } from '../../services';
import { TimeSlot, CreateAppointmentInput } from '../../types/appointment';
import { useFormValidation } from '../../hooks/useFormValidation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function BookAppointment() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const {
    values: formData,
    errors: formErrors,
    getFieldProps,
    validateForm,
    setFieldValue,
    handleChange,
  } = useFormValidation(
    {
      providerId: providerId || '',
      startTime: '',
      duration: 30,
      title: '',
      description: '',
      location: '',
      meetingLink: '',
    },
    {
      duration: { required: true, min: 5, max: 480 },
      title: { maxLength: 200 },
      description: { maxLength: 1000 },
      location: { maxLength: 200 },
      meetingLink: { url: true },
    }
  );

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
      endDate.setDate(endDate.getDate() + 30); // Próximos 30 dias

      const data = await availabilityService.getAvailableSlots(
        providerId,
        startDate.toISOString(),
        endDate.toISOString()
      );
      setSlots(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar horários disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    const startDateTime = new Date(`${date}T${time}`);
    setFieldValue('startTime', startDateTime.toISOString());
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.startTime) {
      setError('Selecione um horário');
      return;
    }

    if (!validateForm()) {
      setError('Por favor, corrija os erros no formulário');
      return;
    }

    const payload: CreateAppointmentInput = {
      providerId: providerId || formData.providerId,
      startTime: formData.startTime,
      duration: typeof formData.duration === 'number' ? formData.duration : parseInt(String(formData.duration), 10) || 30,
      title: formData.title?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      location: formData.location?.trim() || undefined,
      meetingLink: formData.meetingLink?.trim() || undefined,
    };

    try {
      await appointmentService.createAppointment(payload);
      navigate('/agenda');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar agendamento');
    }
  };

  // Agrupa slots por data
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

  if (loading) {
    return <div className="text-center py-8">Carregando horários disponíveis...</div>;
  }

  return (
    <div className="page-container max-w-4xl mx-auto">
      <h1 className="page-title">Agendar Horário</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {availableDates.length === 0 ? (
        <div className="content-card text-center py-8">
          <p className="text-gray-600">Não há horários disponíveis no momento. Tente novamente mais tarde.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seleção de horários */}
          <div className="content-card">
            <h2 className="section-title">Selecione Data e Horário</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {availableDates.map((date) => {
                const dateObj = new Date(date);
                const dateStr = dateObj.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });

                return (
                  <div key={date} className="border-b border-gray-200 pb-4 last:border-0">
                    <h3 className="font-semibold text-gray-900 mb-2 capitalize">
                      {dateStr}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {slotsByDate[date].map((slot) => (
                        <button
                          key={`${slot.date}-${slot.time}`}
                          onClick={() => handleSlotSelect(slot.date, slot.time)}
                          className={`px-3 py-2 rounded text-sm transition-colors ${
                            selectedDate === slot.date && selectedTime === slot.time
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formulário de agendamento */}
          {showForm && (
            <div className="content-card">
              <h2 className="section-title">Detalhes do Agendamento</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Data e Horário Selecionado:</p>
                  <p className="font-semibold text-gray-900">
                    {selectedDate &&
                      new Date(selectedDate).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}{' '}
                    às {selectedTime}
                  </p>
                </div>

                <Input
                  type="number"
                  label="Duração (minutos)"
                  value={formData.duration}
                  onChange={(e) =>
                    handleChange('duration', parseInt(e.target.value, 10) || 30)
                  }
                  min={5}
                  max={480}
                  required
                  error={formErrors.duration}
                />

                <Input
                  type="text"
                  label="Título (opcional)"
                  {...getFieldProps('title')}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição (opcional)
                  </label>
                  <textarea
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Descrição do agendamento"
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>

                <Input
                  type="text"
                  label="Localização (opcional)"
                  placeholder="Presencial ou Online"
                  {...getFieldProps('location')}
                />

                <Input
                  type="url"
                  label="Link da Reunião (se online)"
                  placeholder="https://meet.google.com/..."
                  {...getFieldProps('meetingLink')}
                  error={formErrors.meetingLink}
                />

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    Confirmar Agendamento
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowForm(false);
                      setSelectedDate('');
                      setSelectedTime('');
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

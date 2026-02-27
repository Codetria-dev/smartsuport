import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { useFormValidation } from '../../hooks/useFormValidation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function PublicBookForm() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { date: selectedDate, time: selectedTime } = (location.state as { date?: string; time?: string }) || {};

  const [error, setError] = useState('');

  const {
    values: formData,
    errors: formErrors,
    getFieldProps,
    validateForm,
    handleChange,
  } = useFormValidation(
    {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      duration: 60,
      title: '',
      description: '',
      location: '',
    },
    {
      clientName: { required: true, minLength: 2, maxLength: 100 },
      clientEmail: { required: true, email: true },
      clientPhone: { maxLength: 20 },
      duration: { required: true, min: 5, max: 480 },
      title: { maxLength: 200 },
      description: { maxLength: 1000 },
      location: { maxLength: 200 },
    }
  );

  if (!selectedDate || !selectedTime) {
    navigate(`/book/${providerId}`, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!providerId) {
      setError('Provider não encontrado');
      return;
    }

    if (!validateForm()) {
      setError('Por favor, corrija os erros no formulário');
      return;
    }

    const durationNum = typeof formData.duration === 'number' ? formData.duration : parseInt(String(formData.duration), 10) || 60;

    try {
      const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
      const appointment = await appointmentService.createPublicAppointment({
        providerId,
        startTime: startDateTime.toISOString(),
        duration: durationNum,
        clientName: formData.clientName.trim(),
        clientEmail: formData.clientEmail.trim(),
        clientPhone: formData.clientPhone?.trim() || undefined,
        title: formData.title?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        location: formData.location?.trim() || undefined,
      });

      navigate(`/confirm/${appointment.publicToken}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar agendamento');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <section className="mb-8">
          <h1 className="page-title text-2xl md:text-3xl">Seus Dados</h1>
        </section>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="content-card">
          <div className="p-3 bg-brand/10 rounded-lg mb-6">
            <p className="text-sm text-gray-600">Data e Horário Selecionado:</p>
            <p className="font-semibold text-gray-900">
              {new Date(selectedDate).toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{' '}
              às {selectedTime}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              label="Seu Nome *"
              placeholder="Seu nome completo"
              {...getFieldProps('clientName')}
              required
            />

            <Input
              type="email"
              label="Seu Email *"
              placeholder="seu@email.com"
              {...getFieldProps('clientEmail')}
              required
            />

            <Input
              type="tel"
              label="Telefone (opcional)"
              placeholder="(11) 99999-9999"
              {...getFieldProps('clientPhone')}
            />

            <Input
              type="number"
              label="Duração (minutos)"
              value={formData.duration}
              onChange={(e) => handleChange('duration', parseInt(e.target.value, 10) || 60)}
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand ${
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

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Confirmar Agendamento
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/book/${providerId}`)}
                className="flex-1"
              >
                Voltar
              </Button>
            </div>
          </form>
        </div>
        <div className="mt-8 pt-6 text-left">
          <button
            type="button"
            onClick={() => navigate(`/book/${providerId}`)}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

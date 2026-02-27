import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { availabilityService } from '../../services/availabilityService';
import { useToast } from '../../contexts/ToastContext';
import { TimeSlot } from '../../types/appointment';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ServiceCard from '../../components/agendamento/ServiceCard';
import TimeSlotComponent from '../../components/agendamento/TimeSlot';

interface Provider {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

const SERVICOS = [
  { id: 'consulta-medica', nome: 'Consulta Médica', icon: '' },
  { id: 'avaliacao', nome: 'Avaliação', icon: '' },
  { id: 'consulta-online', nome: 'Consulta Online', icon: '' },
  { id: 'retorno', nome: 'Retorno', icon: '' },
];

export default function NewAppointment() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [duration] = useState(30);

  useEffect(() => {
    if (step === 2) {
      loadProviders();
    }
  }, [step]);

  useEffect(() => {
    if (step === 4 && selectedProvider && selectedDate) {
      loadTimeSlots();
    }
  }, [step, selectedProvider, selectedDate]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getPublicProviders();
      setProviders(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao carregar profissionais';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async () => {
    if (!selectedProvider || !selectedDate) return;

    try {
      setLoading(true);
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 1);

      const slots = await availabilityService.getAvailableSlots(
        selectedProvider.id,
        startDate.toISOString(),
        endDate.toISOString()
      );
      setTimeSlots(slots.filter((slot) => slot.date === selectedDate));
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao carregar horários';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && !selectedService) {
      setError('Selecione um serviço');
      return;
    }
    if (step === 2 && !selectedProvider) {
      setError('Selecione um profissional');
      return;
    }
    if (step === 3 && !selectedDate) {
      setError('Selecione uma data');
      return;
    }
    if (step === 4 && !selectedTime) {
      setError('Selecione um horário');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  const handleConfirm = async () => {
    if (!selectedProvider || !selectedDate || !selectedTime) {
      setError('Complete todos os campos');
      return;
    }

    try {
      setLoading(true);
      const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + duration);

      await appointmentService.createAppointment({
        providerId: selectedProvider.id,
        startTime: startDateTime.toISOString(),
        duration,
        serviceType: SERVICOS.find((s) => s.id === selectedService)?.nome,
        title: `${SERVICOS.find((s) => s.id === selectedService)?.nome} - ${selectedProvider.name}`,
      });

      success('Agendamento criado com sucesso!');
      navigate('/agenda');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao criar agendamento';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getAvailableDates = () => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 5 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Serviço</span>
            <span>Profissional</span>
            <span>Data</span>
            <span>Horário</span>
            <span>Confirmar</span>
          </div>
        </div>

        {/* Content */}
        <Card className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Escolher Serviço */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Escolher Serviço
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SERVICOS.map((servico) => (
                  <ServiceCard
                    key={servico.id}
                    title={servico.nome}
                    icon={servico.icon}
                    description=""
                    onClick={() => {
                      setSelectedService(servico.id);
                      setError('');
                    }}
                  />
                ))}
              </div>
              {selectedService && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Serviço selecionado: <strong>{SERVICOS.find((s) => s.id === selectedService)?.nome}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Escolher Profissional */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Escolher Profissional
              </h2>
              {loading ? (
                <div className="text-center py-8 text-gray-600">Carregando profissionais...</div>
              ) : providers.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  Nenhum profissional disponível
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {providers.map((provider) => (
                    <Card
                      key={provider.id}
                      onClick={() => {
                        setSelectedProvider(provider);
                        setError('');
                      }}
                      className={`p-6 cursor-pointer transition ${
                        selectedProvider?.id === provider.id
                          ? 'border-2 border-blue-600 bg-blue-50'
                          : 'hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {provider.avatar ? (
                          <img
                            src={provider.avatar}
                            alt={provider.name}
                            className="w-16 h-16 rounded-full"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-2xl font-bold text-blue-600">
                              {provider.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                          {provider.email && (
                            <p className="text-sm text-gray-600">{provider.email}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Escolher Data */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Escolher Data
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {getAvailableDates().map((date) => (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date);
                      setError('');
                    }}
                    className={`p-4 border rounded-lg text-center transition ${
                      selectedDate === date
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Escolher Horário */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Escolher Horário
              </h2>
              {selectedDate && (
                <p className="text-gray-600 mb-4">
                  Data selecionada: <strong>{formatDate(selectedDate)}</strong>
                </p>
              )}
              {loading ? (
                <div className="text-center py-8 text-gray-600">Carregando horários...</div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  Nenhum horário disponível para esta data
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {timeSlots
                    .filter((slot) => slot.available)
                    .map((slot) => (
                      <TimeSlotComponent
                        key={slot.time}
                        time={slot.time}
                        available={slot.available}
                        selected={selectedTime === slot.time}
                        onClick={() => {
                          setSelectedTime(slot.time);
                          setError('');
                        }}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Confirmar */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Confirmar Agendamento
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Serviço</p>
                  <p className="font-semibold text-gray-900">
                    {SERVICOS.find((s) => s.id === selectedService)?.nome}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Profissional</p>
                  <p className="font-semibold text-gray-900">{selectedProvider?.name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Data</p>
                  <p className="font-semibold text-gray-900">
                    {selectedDate && formatDate(selectedDate)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Horário</p>
                  <p className="font-semibold text-gray-900">{selectedTime}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Duração</p>
                  <p className="font-semibold text-gray-900">{duration} minutos</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <Button
              onClick={handleBack}
              disabled={step === 1}
              variant="secondary"
            >
              Voltar
            </Button>
            {step < 5 ? (
              <Button onClick={handleNext} isLoading={loading}>
                Próximo
              </Button>
            ) : (
              <Button onClick={handleConfirm} isLoading={loading}>
                Confirmar Agendamento
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

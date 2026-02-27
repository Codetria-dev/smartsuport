import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { availabilityService } from '../../services/availabilityService';
import { TimeSlot } from '../../types/appointment';
export default function PublicBookAppointment() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


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
    navigate(`/book/${providerId}/dados`, { state: { date, time } });
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Carregando horários disponíveis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <section className="mb-8">
          <h1 className="page-title text-2xl md:text-3xl">Agendar Horário</h1>
        </section>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {availableDates.length === 0 ? (
          <div className="content-card text-center py-8">
            <p className="text-gray-600">Não há horários disponíveis no momento. Tente novamente mais tarde.</p>
          </div>
        ) : (
          <div className="content-card mt-6">
            <h2 className="section-title text-lg font-semibold mb-4 text-gray-900">Selecione Data e Horário</h2>
            <p className="text-sm text-gray-500 mb-6">
              Clique em um horário para continuar
            </p>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
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
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {slotsByDate[date].map((slot) => (
                        <button
                          key={`${slot.date}-${slot.time}`}
                          onClick={() => handleSlotSelect(slot.date, slot.time)}
                          className="px-3 py-2 rounded text-sm transition-colors bg-gray-100 text-gray-700 hover:bg-brand hover:text-white"
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
        )}
        <div className="mt-8 pt-6 text-left">
          <button
            type="button"
            onClick={() => navigate('/select-provider')}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

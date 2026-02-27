import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { Appointment, AppointmentStatus } from '../../types/appointment';

type DashboardStats = {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  totalProviders: number;
  totalClients: number;
  totalServices: number;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0,
    totalProviders: 0,
    totalClients: 0,
    totalServices: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simulação de dados - em produção, buscar da API
      setTimeout(() => {
        setStats({
          totalAppointments: 45,
          pendingAppointments: 12,
          confirmedAppointments: 28,
          cancelledAppointments: 5,
          totalProviders: 8,
          totalClients: 120,
          totalServices: 15,
        });
        setRecentAppointments([
          {
            id: '1',
            providerId: 'p1',
            clientId: 'c1',
            startTime: '2026-02-10T10:00:00',
            endTime: '2026-02-10T10:30:00',
            duration: 30,
            status: AppointmentStatus.PENDING,
            serviceType: 'Consulta Médica',
            title: 'Consulta',
            reminderSent: false,
            confirmationSent: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            providerId: 'p2',
            clientId: 'c2',
            startTime: '2026-02-10T14:00:00',
            endTime: '2026-02-10T15:00:00',
            duration: 60,
            status: AppointmentStatus.CONFIRMED,
            serviceType: 'Avaliação',
            title: 'Avaliação',
            reminderSent: false,
            confirmationSent: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try {
        await appointmentService.cancelAppointment(id, 'Cancelado pelo administrador');
        loadDashboardData();
      } catch (error) {
        alert('Erro ao cancelar agendamento');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: AppointmentStatus | string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-blue-100 text-blue-700',
    };
    const labels = {
      PENDING: 'Pendente',
      CONFIRMED: 'Confirmado',
      CANCELLED: 'Cancelado',
      COMPLETED: 'Concluído',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-6xl mx-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="page-title">Dashboard Administrativo</h1>
          <p className="text-gray-600 text-base">Gerencie agendamentos, serviços, profissionais e veja estatísticas</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total de Agendamentos" value={stats.totalAppointments} icon="" color="bg-blue-500" />
          <StatCard title="Pendentes" value={stats.pendingAppointments} icon="" color="bg-yellow-500" />
          <StatCard title="Confirmados" value={stats.confirmedAppointments} icon="" color="bg-green-500" />
          <StatCard title="Cancelados" value={stats.cancelledAppointments} icon="" color="bg-red-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Profissionais" value={stats.totalProviders} icon="" color="bg-purple-500" />
          <StatCard title="Clientes" value={stats.totalClients} icon="" color="bg-indigo-500" />
          <StatCard title="Serviços" value={stats.totalServices} icon="" color="bg-pink-500" />
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="font-medium text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <ActionButton
              label="Gerenciar Agendamentos"
              onClick={() => navigate('/agenda')}
              icon=""
            />
            <ActionButton
              label="Controlar Serviços"
              onClick={() => alert('Funcionalidade em desenvolvimento')}
              icon=""
            />
            <ActionButton
              label="Controlar Profissionais"
              onClick={() => navigate('/admin/users')}
              icon=""
            />
            <ActionButton
              label="Ver Estatísticas"
              onClick={() => alert('Funcionalidade em desenvolvimento')}
              icon=""
            />
          </div>
        </div>

        {/* Todos os Agendamentos */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-medium text-gray-900">
              Todos os Agendamentos
            </h2>
            <button
              onClick={() => navigate('/agenda')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos →
            </button>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white text-gray-600">
                  <tr>
                    <th className="text-left p-3">ID</th>
                    <th className="text-left p-3">Serviço</th>
                    <th className="text-left p-3">Data</th>
                    <th className="text-left p-3">Horário</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-white">
                      <td className="p-3 font-mono text-xs">{appointment.id.slice(0, 8)}...</td>
                      <td className="p-3">{appointment.serviceType || appointment.title || 'N/A'}</td>
                      <td className="p-3">{formatDate(appointment.startTime)}</td>
                      <td className="p-3">
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </td>
                      <td className="p-3">{getStatusBadge(appointment.status)}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/appointments/${appointment.id}`)}
                            className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                          >
                            Editar
                          </button>
                          {appointment.status !== AppointmentStatus.CANCELLED && (
                            <button
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="text-red-600 hover:text-red-700 text-xs font-medium"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border">
      {icon ? (
        <div className="flex items-center justify-between mb-2">
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-xl`}>
            {icon}
          </div>
        </div>
      ) : (
        <div className={`w-10 h-10 ${color} rounded-lg mb-2`} aria-hidden />
      )}
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 bg-white hover:bg-gray-100 rounded-lg text-center transition border border-gray-200"
    >
      {icon ? <div className="text-2xl mb-2">{icon}</div> : null}
      <div className="text-xs font-medium text-gray-700">{label}</div>
    </button>
  );
}

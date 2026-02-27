import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService, UserListItem, UsersListResponse } from '../../services/adminService';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';

export default function AdminUsers() {
  const { t } = useTranslation(['admin', 'common']);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    role: '',
    plan: '',
    isActive: undefined as boolean | undefined,
  });

  useEffect(() => {
    loadUsers();
  }, [pagination.page, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data: UsersListResponse = await adminService.listUsers({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error || t('admin:loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await adminService.toggleUserStatus(userId, !currentStatus);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || t('admin:toggleError'));
    }
  };

  if (loading && users.length === 0) return <Loading />;

  return (
    <div className="page-container max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title mb-0">{t('admin:usersTitle')}</h1>
      </div>

      {/* Filtros */}
      <div className="content-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin:role')}</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <option value="">{t('admin:all')}</option>
              <option value="ADMIN">{t('admin:admin')}</option>
              <option value="PROVIDER">{t('admin:provider')}</option>
              <option value="CLIENT">{t('admin:client')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin:plan')}</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filters.plan}
              onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
            >
              <option value="">{t('admin:all')}</option>
              <option value="FREE">FREE</option>
              <option value="PRO">PRO</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin:status')}</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  isActive: e.target.value === '' ? undefined : e.target.value === 'true',
                })
              }
            >
              <option value="">{t('admin:all')}</option>
              <option value="true">{t('admin:active')}</option>
              <option value="false">{t('admin:inactive')}</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin:name')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin:email')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin:role')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin:plan')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin:status')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin:actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      user.plan === 'PRO'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.plan}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? t('admin:active') : t('admin:inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Button
                    variant={user.isActive ? 'danger' : 'secondary'}
                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                    className="text-xs"
                  >
                    {user.isActive ? t('admin:deactivate') : t('admin:activate')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
          >
            {t('admin:previous')}
          </Button>
          <span className="px-4 py-2 text-sm text-gray-700">
            {t('admin:pageOf', { page: pagination.page, total: pagination.totalPages })}
          </span>
          <Button
            variant="secondary"
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === pagination.totalPages}
          >
            {t('admin:next')}
          </Button>
        </div>
      )}
    </div>
  );
}

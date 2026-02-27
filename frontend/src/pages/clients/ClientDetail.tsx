import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clientService, ClientListItem } from '../../services/clientService';
import { useToast } from '../../contexts/ToastContext';
import Loading from '../../components/ui/Loading';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('clients');
  const { success, error: showError } = useToast();
  const [client, setClient] = useState<ClientListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    clientService
      .getClient(id)
      .then((data) => {
        if (!cancelled) setClient(data);
      })
      .catch((err: any) => {
        if (!cancelled) {
          showError(err.response?.data?.error || t('clientNotFound'));
          navigate('/clients');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate, showError]);

  const handleDelete = async () => {
    if (!id || !client) return;
    if (!window.confirm(t('deleteConfirm', { name: client.name }))) return;
    setDeleting(true);
    try {
      await clientService.deleteClient(id);
      success(t('clientDeleted'));
      navigate('/clients');
    } catch (err: any) {
      showError(err.response?.data?.error || t('deleteError'));
    } finally {
      setDeleting(false);
    }
  };

  const formatRegistered = (iso: string) => {
    const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
    return new Date(iso).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading || !id) {
    return <Loading fullScreen message={t('loading')} />;
  }

  if (!client) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-6">
      <Link
        to="/clients"
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 block"
      >
        {t('backToClients')}
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('detailTitle')}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {t('detailSubtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{t('name')}</p>
            <p className="text-base font-medium text-gray-900 mt-1">{client.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{t('email')}</p>
            <p className="text-base font-medium text-gray-900 mt-1">{client.email}</p>
          </div>
          {client.phone && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{t('phone')}</p>
              <p className="text-base font-medium text-gray-900 mt-1">{client.phone}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{t('registeredLabel')}</p>
            <p className="text-base font-medium text-gray-900 mt-1">
              {formatRegistered(client.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Link
            to={`/clients/${id}/agendar`}
            className="px-5 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
          >
            {t('scheduleAppointment')}
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2 rounded-lg border border-gray-300 text-red-600 font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {deleting ? t('deleting') : t('deleteClient')}
          </button>
        </div>
      </div>
    </div>
  );
}

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

  const btnPrimaryStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '2.75rem',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '12px',
    background: '#d64e38',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background 0.15s',
  };

  const btnSecondaryStyle: React.CSSProperties = {
    minHeight: '2.75rem',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    color: '#b91c1c',
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.15s',
  };

  return (
    <div style={{ maxWidth: '768px', margin: '40px auto 0', padding: '0 24px' }}>
      <Link
        to="/clients"
        style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none', display: 'block', marginBottom: '16px' }}
      >
        {t('backToClients')}
      </Link>

      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 24px -8px rgba(0,0,0,0.08)',
        border: '1px solid #f0ebe7',
        padding: '32px',
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111827', margin: 0 }}>
          {t('detailTitle')}
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
          {t('detailSubtitle')}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginTop: '24px',
        }}>
          <div>
            <p style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{t('name')}</p>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#111827', margin: '4px 0 0 0' }}>{client.name}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{t('email')}</p>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#111827', margin: '4px 0 0 0' }}>{client.email}</p>
          </div>
          {client.phone && (
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{t('phone')}</p>
              <p style={{ fontSize: '15px', fontWeight: 500, color: '#111827', margin: '4px 0 0 0' }}>{client.phone}</p>
            </div>
          )}
          <div>
            <p style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{t('registeredLabel')}</p>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#111827', margin: '4px 0 0 0' }}>
              {formatRegistered(client.createdAt)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <Link
            to={`/clients/${id}/agendar`}
            style={btnPrimaryStyle}
          >
            {t('scheduleAppointment')}
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              ...btnSecondaryStyle,
              opacity: deleting ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.background = '#fef2f2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
          >
            {deleting ? t('deleting') : t('deleteClient')}
          </button>
        </div>
      </div>
    </div>
  );
}

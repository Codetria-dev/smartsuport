import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clientService, ClientListItem } from '../../services/clientService';
import { useToast } from '../../contexts/ToastContext';
import Loading from '../../components/ui/Loading';

export default function ClientsList() {
  const { t, i18n } = useTranslation('clients');
  const { error: showError } = useToast();
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.trim().toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [clients, search]);

  useEffect(() => {
    let cancelled = false;
    clientService
      .getClients()
      .then((data) => {
        if (!cancelled) setClients(data);
      })
      .catch((err: any) => {
        if (!cancelled) {
          showError(err.response?.data?.error || t('loadClientsError'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showError]);

  const formatRegisteredDate = (iso: string) => {
    const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
    return new Date(iso).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return <Loading fullScreen message={t('loadingClients')} />;
  }

  return (
    <div
      className="max-w-4xl mx-auto px-6 py-8"
      style={{ maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto', padding: '2rem 1.5rem' }}
    >
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
          {t('title')}
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          {t('subtitle')}
        </p>
        <input
          type="search"
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search clients"
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            fontSize: '0.875rem',
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = '0 0 0 2px #111827';
            e.target.style.borderColor = 'transparent';
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
            e.target.style.borderColor = '#e5e7eb';
          }}
        />
      </header>

      {clients.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '5rem' }}>
          <p style={{ color: '#111827', fontWeight: 500 }}>{t('noClientsYet')}</p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {t('noClientsHint')}
          </p>
          <Link
            to="/register-client"
            style={{
              display: 'inline-block',
              backgroundColor: '#f97316',
              color: '#fff',
              padding: '0.5rem 1.25rem',
              borderRadius: '0.5rem',
              marginTop: '1rem',
              fontWeight: 500,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ea580c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f97316';
            }}
          >
            {t('addClient')}
          </Link>
        </div>
      ) : filteredClients.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            marginTop: '3rem',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
            backgroundColor: 'rgba(249, 250, 251, 0.5)',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {t('noResults', { search })}
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredClients.map((client) => (
            <li key={client.id}>
              <Link
                to={`/clients/${client.id}`}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                  backgroundColor: '#fff',
                  borderRadius: '0.75rem',
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                  border: '1px solid #e5e7eb',
                  padding: '1rem',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
                className="hover:border-gray-300"
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {client.name}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {client.email}
                  </p>
                  {client.phone && (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.125rem 0 0' }}>
                      {client.phone}
                    </p>
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', flexShrink: 0 }}>
                  {t('registered', { date: formatRegisteredDate(client.createdAt) })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clientService, ClientListItem } from '../../services/clientService';
import { useToast } from '../../contexts/ToastContext';
import Loading from '../../components/ui/Loading';

export default function ClientsList() {
  const { t, i18n } = useTranslation('clients');
  const { error: showError } = useToast();
  const navigate = useNavigate();
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

  const formatRegisteredDate = useCallback((iso: string) => {
    const locale = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
    return new Date(iso).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [i18n.language]);

  const inputStyle = {
    width: '100%',
    padding: '12px 16px 12px 40px',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const cardStyle = {
    display: 'block',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06), 0 4px 14px -2px rgba(0,0,0,0.06)',
    border: '1px solid #f0ebe7',
    padding: '16px',
    textDecoration: 'none',
    transition: 'all 0.15s',
    cursor: 'pointer',
  };

  if (loading) {
    return <Loading fullScreen message={t('loadingClients')} />;
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', background: 'linear-gradient(180deg, #fef6f2 0%, #f9fafb 100%)', padding: '32px 16px' }}>
      <div style={{ width: '100%', maxWidth: '896px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(214, 78, 56, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg style={{ width: '24px', height: '24px', color: '#d64e38' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', letterSpacing: '-0.025em', margin: 0 }}>{t('title')}</h1>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>{t('subtitle')}</p>
            </div>
          </div>

          {/* Search */}
          <div style={{ maxWidth: '448px', position: 'relative' }}>
            <svg
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af', pointerEvents: 'none' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search clients"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#d64e38'; e.target.style.boxShadow = '0 0 0 3px rgba(214, 78, 56, 0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </header>

        {/* Content */}
        {clients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(214, 78, 56, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg style={{ width: '32px', height: '32px', color: 'rgba(214, 78, 56, 0.4)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p style={{ color: '#111827', fontWeight: 500, margin: 0 }}>{t('noClientsYet')}</p>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>{t('noClientsHint')}</p>
            <button
              type="button"
              onClick={() => navigate('/register-client')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '20px', backgroundColor: '#d64e38', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('addClient')}
            </button>
          </div>
        ) : filteredClients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', borderRadius: '12px', border: '1px solid #f0ebe7', backgroundColor: 'rgba(255,255,255,0.5)' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              {t('noResults', { search })}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => navigate(`/clients/${client.id}`)}
                style={cardStyle}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(214, 78, 56, 0.2)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.08), 0 8px 20px -4px rgba(0,0,0,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f0ebe7'; e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.06), 0 4px 14px -2px rgba(0,0,0,0.06)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {client.name}
                    </p>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {client.email}
                    </p>
                    {client.phone && (
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {client.phone}
                      </p>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', flexShrink: 0, textAlign: 'right' }}>
                    {t('registered', { date: formatRegisteredDate(client.createdAt) })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

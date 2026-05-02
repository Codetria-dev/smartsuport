import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appointmentService } from '../../services/appointmentService';
import StepIndicator from '../../components/ui/StepIndicator';

interface Provider {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  profileDescription?: string;
}

export default function SelectProvider() {
  const { t } = useTranslation('public');
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getPublicProviders();
      setProviders(data);
    } catch (err: any) {
      setError(err.response?.data?.error || t('errorLoadingProviders'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProvider = (providerId: string) => {
    navigate(`/book/${providerId}`);
  };

  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #fef6f2, #f9fafb)',
  };

  const containerStyle = {
    maxWidth: '1152px',
    margin: '0 auto',
    padding: '40px 24px 48px',
  };

  const cardStyle = (id: string) => ({
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #f0ebe7',
    boxShadow: hoveredCard === id
      ? '0 8px 30px -6px rgba(0,0,0,0.1)'
      : '0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 24px -8px rgba(0,0,0,0.08)',
    padding: '28px',
    cursor: 'pointer' as const,
    transition: 'box-shadow 0.25s, transform 0.25s',
    transform: hoveredCard === id ? 'translateY(-2px)' : 'translateY(0)',
    display: 'flex',
    flexDirection: 'column' as const,
  });

  const btnPrimaryStyle = (id: string) => ({
    width: '100%',
    padding: '10px 24px',
    fontSize: '13px',
    fontWeight: 700,
    background: hoveredBtn === id ? '#b83d2a' : '#d64e38',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer' as const,
    transition: 'background 0.2s',
    marginTop: 'auto',
  });

  if (loading) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #d64e38',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ fontSize: '16px', color: '#6b7280', fontWeight: 500, margin: 0 }}>
            {t('loadingProviders')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ marginBottom: '40px' }}>
          <StepIndicator
            currentStep={0}
            steps={[t('stepProfessional'), t('stepDateTime'), t('stepYourData')]}
          />
        </div>

        <section style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
            {t('selectProvider')}
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: '4px 0 0 0' }}>
            {t('selectProviderSubtitle')}
          </p>
        </section>

        {error && (
          <div style={{
            marginBottom: '32px',
            padding: '16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '12px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {providers.length === 0 ? (
          <div style={{ maxWidth: '576px', margin: '0 auto', textAlign: 'center', padding: '64px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(214,78,56,0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d64e38" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
              {t('noProvidersMessage')}
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '10px 24px',
                fontSize: '13px',
                fontWeight: 600,
                background: '#fff',
                color: '#374151',
                border: '1.5px solid #d1d5db',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
            >
              {t('backToHome')}
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}>
            {providers.map((provider) => (
              <div
                key={provider.id}
                style={cardStyle(provider.id)}
                onClick={() => handleSelectProvider(provider.id)}
                onMouseEnter={() => setHoveredCard(provider.id)}
                onMouseLeave={() => { setHoveredCard(null); setHoveredBtn(null); }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Avatar e nome */}
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {provider.avatar ? (
                      <img
                        src={provider.avatar}
                        alt={provider.name}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          margin: '0 auto 16px',
                          objectFit: 'cover',
                          border: '2px solid rgba(214,78,56,0.1)',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(214,78,56,0.15), rgba(214,78,56,0.05))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        border: '2px solid rgba(214,78,56,0.1)',
                      }}>
                        <span style={{ fontSize: '24px', fontWeight: 700, color: '#d64e38' }}>
                          {provider.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>
                      {provider.name}
                    </h3>
                  </div>

                  {/* Descrição */}
                  <div style={{ flex: 1, minHeight: 0, marginBottom: '16px' }}>
                    {provider.profileDescription ? (
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        lineHeight: '1.625',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textAlign: 'left',
                      }}>
                        {provider.profileDescription}
                      </p>
                    ) : (
                      <p style={{
                        fontSize: '14px',
                        color: '#9ca3af',
                        fontStyle: 'italic',
                        textAlign: 'left',
                        margin: 0,
                      }}>
                        {t('noProfileDescription')}
                      </p>
                    )}
                  </div>

                  {/* Email / Telefone */}
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '16px' }}>
                    {provider.email && (
                      <p style={{
                        margin: '0 0 4px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }} title={provider.email}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {provider.email}
                      </p>
                    )}
                    {provider.phone && (
                      <p style={{
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {provider.phone}
                      </p>
                    )}
                  </div>

                  <button
                    style={btnPrimaryStyle(provider.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectProvider(provider.id);
                    }}
                    onMouseEnter={() => setHoveredBtn(provider.id)}
                    onMouseLeave={() => setHoveredBtn(null)}
                  >
                    {t('bookSlot')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rodapé — Voltar ao início */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #f0ebe7', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: 500,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#d64e38')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('backToHome')}
          </button>
        </div>
      </div>
    </div>
  );
}

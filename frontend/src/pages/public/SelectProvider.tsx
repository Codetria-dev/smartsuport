import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appointmentService } from '../../services/appointmentService';
import Button from '../../components/ui/Button';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-base text-gray-700">{t('loadingProviders')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-6xl mx-auto py-8 px-4 sm:px-6 pb-24">
      <section className="mb-8">
        <h1 className="page-title text-2xl md:text-3xl">
          {t('selectProvider')}
        </h1>
      </section>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {providers.length === 0 ? (
        <div className="content-card max-w-xl mx-auto text-center py-8">
          <p className="text-gray-600 mb-6">{t('noProvidersMessage')}</p>
          <Button onClick={() => navigate('/')} variant="secondary">
            {t('backToHome')}
          </Button>
        </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="content-card p-6 hover:shadow-md transition-shadow cursor-pointer flex flex-col min-h-[280px]"
                onClick={() => handleSelectProvider(provider.id)}
              >
                <div className="flex flex-col h-full">
                  <div className="text-center mb-4">
                    {provider.avatar ? (
                      <img
                        src={provider.avatar}
                        alt={provider.name}
                        className="w-20 h-20 rounded-full mx-auto mb-3"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-brand/20 flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl font-bold text-brand-darker">
                          {provider.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-gray-900">
                      {provider.name}
                    </h3>
                  </div>
                  {/* Card de apresentação (perfil salvo) */}
                  <div className="flex-1 min-h-0 mb-4">
                    {provider.profileDescription ? (
                      <p className="text-sm text-gray-600 line-clamp-4 text-left leading-relaxed">
                        {provider.profileDescription}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic text-left">
                        {t('noProfileDescription')}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 space-y-1 mb-3">
                    {provider.email && <p className="truncate" title={provider.email}>{provider.email}</p>}
                    {provider.phone && <p>{provider.phone}</p>}
                  </div>
                  <Button className="w-full mt-auto">
                    {t('bookSlot')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

      <div className="mt-8 pt-6 text-left">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          ← {t('backToHome')}
        </button>
      </div>
    </div>
  );
}

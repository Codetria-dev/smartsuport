import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';

export default function BillingSuccess() {
  const { t } = useTranslation('billing');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setError('Parâmetro session_id não encontrado.');
      return;
    }

    const syncUser = async () => {
      try {
        const response = await api.get('/auth/me');
        updateUser(response.data);
      } catch {
        // Ignora erro; usuário pode já estar atualizado pelo webhook
      } finally {
        setLoading(false);
      }
    };

    syncUser();
  }, [sessionId, updateUser]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
          {error}
        </div>
        <Button onClick={() => navigate('/billing/plans')}>{t('backToPlans')}</Button>
      </div>
    );
  }

  return (
    <div className="page-container max-w-md mx-auto text-center">
      <div className="content-card bg-green-50 border-green-200 text-green-800 p-6 mb-6">
        <h1 className="page-title text-xl mb-2">{t('successTitle')}</h1>
        <p className="text-sm">{t('successMessage')}</p>
      </div>
      <Button className="w-full" onClick={() => navigate('/billing/plans')}>
        {t('viewMyPlans')}
      </Button>
    </div>
  );
}

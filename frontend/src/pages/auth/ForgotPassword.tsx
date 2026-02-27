import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import { useFormValidation } from '../../hooks/useFormValidation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
export default function ForgotPassword() {
  const { t } = useTranslation(['common', 'auth']);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    values,
    getFieldProps,
    validateForm,
  } = useFormValidation(
    { email: '' },
    { email: { required: true, email: true } }
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setError(t('auth:invalidEmailError'));
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword(values.email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth:recoverError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="saas-layout">
      <section className="saas-header">
        <h1 className="saas-title">{t('auth:recoverPassword')}</h1>
        <p className="saas-subtitle">{t('auth:recoverPasswordSubtitle')}</p>
      </section>
      <div className="saas-card">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              <p className="font-medium mb-2">{t('auth:emailSentSuccess')}</p>
              <p className="text-sm">
                {t('auth:emailSentDetail')}
              </p>
            </div>
            <Link
              to="/login"
              className="text-brand-darker hover:text-brand-dark font-medium text-sm"
            >
              {t('auth:backToLoginLink')}
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <Input
                type="email"
                label={t('auth:email')}
                placeholder={t('auth:emailPlaceholder')}
                {...getFieldProps('email')}
                required
                autoComplete="email"
              />

              <Button type="submit" isLoading={isLoading} className="w-full">
                {t('auth:sendInstructions')}
              </Button>
            </form>

            <div className="saas-footer saas-footer-stacked">
              <Link to="/login">{t('auth:backToLoginLink')}</Link>
              <p>
                {t('auth:noAccount')}{' '}
                <Link to="/register">{t('auth:createAccount')}</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

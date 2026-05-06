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

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(to bottom, #fef6f2, #f9fafb)',
    padding: '24px 16px',
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '420px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 24px -8px rgba(0,0,0,0.08)',
    border: '1px solid #f0ebe7',
    padding: '40px 32px',
    textAlign: 'center',
  };

  const alertErrorStyle: React.CSSProperties = {
    padding: '12px 16px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    borderRadius: '12px',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'left',
  };

  const alertSuccessStyle: React.CSSProperties = {
    padding: '16px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    borderRadius: '12px',
    marginBottom: '24px',
    textAlign: 'left',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.025em' }}>
            {t('auth:recoverPassword')}
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {t('auth:recoverPasswordSubtitle')}
          </p>
        </div>

        {error && (
          <div style={alertErrorStyle}>
            {error}
          </div>
        )}

        {success ? (
          <>
            <div style={alertSuccessStyle}>
              <p style={{ fontWeight: 500, marginBottom: '8px', margin: '0 0 8px 0' }}>{t('auth:emailSentSuccess')}</p>
              <p style={{ fontSize: '14px', margin: 0 }}>{t('auth:emailSentDetail')}</p>
            </div>
            <Link
              to="/login"
              style={{ fontSize: '14px', fontWeight: 500, color: '#b83d2a', textDecoration: 'none' }}
            >
              {t('auth:backToLoginLink')}
            </Link>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <Input
                  type="email"
                  label={t('auth:email')}
                  placeholder={t('auth:emailPlaceholder')}
                  {...getFieldProps('email')}
                  required
                  autoComplete="email"
                />
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full">
                {t('auth:sendInstructions')}
              </Button>
            </form>

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0ebe7' }}>
              <Link to="/login" style={{ fontSize: '14px', fontWeight: 500, color: '#d64e38', textDecoration: 'none' }}>
                {t('auth:backToLoginLink')}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

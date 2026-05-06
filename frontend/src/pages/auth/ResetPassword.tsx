import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import { useFormValidation } from '../../hooks/useFormValidation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ResetPassword() {
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    values,
    getFieldProps,
    validateForm,
    handleChange,
    handleBlur,
    errors,
    touched,
  } = useFormValidation(
    { password: '', confirmPassword: '' },
    {
      password: { required: true, minLength: 6, maxLength: 128 },
      confirmPassword: {
        required: true,
        custom: (value, allValues) =>
          value !== allValues?.password ? 'passwordsDontMatch' : null,
      },
    }
  );

  useEffect(() => {
    if (!token) {
      setError(t('invalidTokenMissing'));
    }
  }, [token, t]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm() || !token) {
      if (!token) setError(t('invalidToken'));
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, values.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || t('resetError'));
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
    textAlign: 'center' as const,
  };

  const alertErrorStyle: React.CSSProperties = {
    padding: '16px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    borderRadius: '12px',
    fontSize: '14px',
    textAlign: 'left' as const,
  };

  const alertSuccessStyle: React.CSSProperties = {
    padding: '16px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    borderRadius: '12px',
    marginBottom: '24px',
    textAlign: 'left' as const,
  };

  if (!token) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={alertErrorStyle}>
            <p style={{ fontWeight: 500, margin: 0 }}>{t('invalidToken')}</p>
            <p style={{ margin: '8px 0 0 0' }}>{t('invalidTokenDetail')}</p>
          </div>
          <div style={{ marginTop: '20px' }}>
            <Link to="/forgot-password" style={{ fontSize: '14px', fontWeight: 500, color: '#d64e38', textDecoration: 'none' }}>
              {t('requestNewLink')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={alertSuccessStyle}>
            <p style={{ fontWeight: 500, margin: 0 }}>{t('passwordResetSuccess')}</p>
            <p style={{ margin: '8px 0 0 0' }}>{t('redirectToLogin')}</p>
          </div>
          <div>
            <Link to="/login" style={{ fontSize: '14px', fontWeight: 500, color: '#d64e38', textDecoration: 'none' }}>
              {t('goToLoginNow')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.025em' }}>
            {t('resetPasswordTitle')}
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {t('resetPasswordSubtitleShort')}
          </p>
        </div>

        {error && (
          <div style={{ ...alertErrorStyle, marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <Input
              type="password"
              label={t('newPassword')}
              placeholder={t('passwordMinPlaceholder')}
              {...getFieldProps('password')}
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <Input
              type="password"
              label={t('confirmNewPassword')}
              placeholder={t('confirmPasswordPlaceholder')}
              value={values.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              error={touched.confirmPassword && errors.confirmPassword ? t('passwordsDontMatch') : undefined}
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            {t('resetPassword')}
          </Button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0ebe7' }}>
          <Link to="/login" style={{ fontSize: '14px', fontWeight: 500, color: '#d64e38', textDecoration: 'none' }}>
            {t('backToLoginLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}

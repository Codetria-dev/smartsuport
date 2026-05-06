import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Login() {
  const { login, enterDemo } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'auth']);

  const {
    values,
    getFieldProps,
    validateForm,
  } = useFormValidation(
    { email: '', password: '' },
    {
      email: { required: true, email: true },
      password: { required: true, minLength: 6 },
    }
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError(t('common:fixFormErrors'));
      return;
    }

    setIsLoading(true);

    try {
      await login({ email: values.email, password: values.password });
      success(t('auth:loginSuccess'));
      navigate('/dashboard');
    } catch (err: any) {
      showError(err.message || t('auth:loginError'));
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
  };

  const brandStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '32px',
  };

  const linkStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: '#d64e38',
    textDecoration: 'none',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={brandStyle}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.025em', color: '#111827' }}>Smart</span>
            <span style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.025em', color: '#d64e38' }}>Support</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.025em' }}>
            {t('auth:login')}
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {t('auth:loginSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <Input
              type="email"
              label={t('auth:email')}
              placeholder={t('auth:emailPlaceholder')}
              {...getFieldProps('email')}
              required
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Input
              type="password"
              label={t('auth:password')}
              placeholder={t('auth:passwordPlaceholder')}
              {...getFieldProps('password')}
              required
              autoComplete="current-password"
            />
            <div style={{ textAlign: 'right', marginTop: '6px' }}>
              <Link to="/forgot-password" style={linkStyle}>
                {t('auth:forgotPassword')}
              </Link>
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            {t('auth:enter')}
          </Button>
        </form>

        <div style={{ marginTop: '24px' }}>
          <button
            type="button"
            onClick={() => {
              enterDemo();
              navigate('/dashboard');
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              color: '#374151',
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
          >
            <svg style={{ width: '20px', height: '20px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {t('auth:viewDemo')}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0ebe7' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {t('auth:noAccount')}{' '}
            <Link to="/register" style={{ ...linkStyle }}>
              {t('auth:createAccount')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

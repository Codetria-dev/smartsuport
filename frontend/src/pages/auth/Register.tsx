import { useState, FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Register() {
  const { register } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isProfessional = searchParams.get('role') === 'provider';
  const { t } = useTranslation(['common', 'auth']);
  const [isLoading, setIsLoading] = useState(false);

  const {
    values,
    getFieldProps,
    validateForm,
  } = useFormValidation(
    { name: '', email: '', password: '', phone: '' },
    {
      name: { required: true, minLength: 2, maxLength: 100 },
      email: { required: true, email: true },
      password: { required: true, minLength: 6, maxLength: 128 },
      phone: { maxLength: 20 },
    }
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError(t('common:fixFormErrors'));
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone?.trim() || undefined,
        ...(isProfessional ? { role: 'PROVIDER' as const } : {}),
      });
      success(t('auth:registerSuccess'));
      navigate('/dashboard');
    } catch (err: any) {
      showError(err.message || t('auth:registerError'));
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

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={brandStyle}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.025em', color: '#111827' }}>Smart</span>
            <span style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.025em', color: '#d64e38' }}>Support</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.025em' }}>
            {t('auth:register')}
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {t('auth:registerSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <Input
              type="text"
              label={t('auth:fullName')}
              placeholder={t('auth:fullNamePlaceholder')}
              {...getFieldProps('name')}
              required
              autoComplete="name"
            />
          </div>

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

          <div style={{ marginBottom: '20px' }}>
            <Input
              type="password"
              label={t('auth:password')}
              placeholder={t('auth:passwordMinPlaceholder')}
              {...getFieldProps('password')}
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Input
              type="tel"
              label={t('auth:phoneOptional')}
              placeholder={t('auth:phonePlaceholder')}
              {...getFieldProps('phone')}
              autoComplete="tel"
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            {t('auth:registerButton')}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0ebe7' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            {t('auth:hasAccount')}{' '}
            <Link to="/login" style={{ fontSize: '14px', fontWeight: 500, color: '#d64e38', textDecoration: 'none' }}>
              {t('auth:doLogin')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

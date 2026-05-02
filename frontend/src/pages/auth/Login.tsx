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

  return (
    <div className="saas-layout">
      <section className="saas-header">
        <div className="mb-6">
          <span className="text-2xl font-bold tracking-tight text-gray-900">Smart</span>
          <span className="text-2xl font-bold tracking-tight text-brand">Support</span>
        </div>
        <h1 className="saas-title">{t('auth:login')}</h1>
        <p className="saas-subtitle">{t('auth:loginSubtitle')}</p>
      </section>
      <div className="saas-card">
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            label={t('auth:email')}
            placeholder={t('auth:emailPlaceholder')}
            {...getFieldProps('email')}
            required
            autoComplete="email"
          />

          <div>
            <Input
              type="password"
              label={t('auth:password')}
              placeholder={t('auth:passwordPlaceholder')}
              {...getFieldProps('password')}
              required
              autoComplete="current-password"
            />
            <div className="saas-link-right">
              <Link to="/forgot-password">{t('auth:forgotPassword')}</Link>
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            {t('auth:enter')}
          </Button>
        </form>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => {
              enterDemo();
              navigate('/dashboard');
            }}
            className="w-full py-3 px-4 text-base font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {t('auth:viewDemo')}
          </button>
        </div>

        <div className="saas-footer">
          <p>
            {t('auth:noAccount')}{' '}
            <Link to="/register">{t('auth:createAccount')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

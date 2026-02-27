import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function Login() {
  const { login } = useAuth();
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

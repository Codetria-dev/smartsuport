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

  return (
    <div className="saas-layout">
      <section className="saas-header">
        <h1 className="saas-title">{t('auth:register')}</h1>
        <p className="saas-subtitle">{t('auth:registerSubtitle')}</p>
      </section>
      <div className="saas-card">
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            label={t('auth:fullName')}
            placeholder={t('auth:fullNamePlaceholder')}
            {...getFieldProps('name')}
            required
            autoComplete="name"
          />

          <Input
            type="email"
            label={t('auth:email')}
            placeholder={t('auth:emailPlaceholder')}
            {...getFieldProps('email')}
            required
            autoComplete="email"
          />

          <Input
            type="password"
            label={t('auth:password')}
            placeholder={t('auth:passwordMinPlaceholder')}
            {...getFieldProps('password')}
            required
            autoComplete="new-password"
            minLength={6}
          />

          <Input
            type="tel"
            label={t('auth:phoneOptional')}
            placeholder={t('auth:phonePlaceholder')}
            {...getFieldProps('phone')}
            autoComplete="tel"
          />

          <Button type="submit" isLoading={isLoading} className="w-full">
            {t('auth:registerButton')}
          </Button>
        </form>

        <div className="saas-footer">
          <p>
            {t('auth:hasAccount')}{' '}
            <Link to="/login">{t('auth:doLogin')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

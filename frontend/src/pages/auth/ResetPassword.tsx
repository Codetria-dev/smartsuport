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

  if (!token) {
    return (
      <div className="saas-layout">
        <div className="saas-card">
          <div className="text-center">
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              <p className="font-medium">{t('invalidToken')}</p>
              <p className="mt-2">{t('invalidTokenDetail')}</p>
            </div>
            <div className="saas-footer" style={{ marginTop: 0 }}>
              <Link to="/forgot-password">{t('requestNewLink')}</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="saas-layout">
        <div className="saas-card">
          <div className="text-center">
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              <p className="font-medium">{t('passwordResetSuccess')}</p>
              <p className="mt-2">{t('redirectToLogin')}</p>
            </div>
            <div className="saas-footer" style={{ marginTop: 0 }}>
              <Link to="/login">{t('goToLoginNow')}</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="saas-layout">
      <section className="saas-header">
        <h1 className="saas-title">{t('resetPasswordTitle')}</h1>
        <p className="saas-subtitle">{t('resetPasswordSubtitleShort')}</p>
      </section>
      <div className="saas-card">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            label={t('newPassword')}
            placeholder={t('passwordMinPlaceholder')}
            {...getFieldProps('password')}
            required
            autoComplete="new-password"
            minLength={6}
          />

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

          <Button type="submit" isLoading={isLoading} className="w-full">
            {t('resetPassword')}
          </Button>
        </form>

        <div className="saas-footer">
          <Link to="/login">{t('backToLoginLink')}</Link>
        </div>
      </div>
    </div>
  );
}

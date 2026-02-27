import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import { authService } from '../../services/authService';
import Input from '../../components/ui/Input';

const inputClassName =
  '!px-3 !py-2 text-sm focus:!ring-2 focus:!ring-gray-900 focus:!border-transparent';

export default function RegisterClient() {
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'clients']);
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
      await authService.registerClient({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone?.trim() || undefined,
      });
      success(t('clients:successMessage'));
      navigate('/clients');
    } catch (err: any) {
      showError(err.response?.data?.error || err.message || t('clients:errorMessage'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container max-w-xl mx-auto">
      <div className="bg-white shadow-md rounded-xl p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('clients:registerTitle')}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {t('clients:registerSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label={t('clients:name')}
            placeholder={t('clients:namePlaceholder')}
            className={inputClassName}
            {...getFieldProps('name')}
            required
            autoComplete="name"
          />
          <Input
            type="email"
            label={t('clients:email')}
            placeholder={t('clients:emailPlaceholder')}
            className={inputClassName}
            {...getFieldProps('email')}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            label={t('clients:passwordLabel')}
            placeholder={t('clients:passwordPlaceholder')}
            className={inputClassName}
            {...getFieldProps('password')}
            required
            autoComplete="new-password"
            minLength={6}
          />
          <Input
            type="tel"
            label={t('clients:phoneLabel')}
            placeholder={t('clients:phonePlaceholder')}
            className={inputClassName}
            {...getFieldProps('phone')}
          />

          <div
            className="flex justify-end gap-3 border-t border-gray-200"
            style={{ marginTop: '2.5rem', paddingTop: '1.5rem' }}
          >
            <button
              type="button"
              onClick={() => navigate('/agenda')}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {t('clients:cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? t('clients:saving') : t('clients:submitButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import { authService } from '../../services/authService';

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

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', background: 'linear-gradient(180deg, #fef6f2 0%, #f9fafb 100%)', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: '768px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button
            type="button"
            onClick={() => navigate('/clients')}
            style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px', padding: 0 }}
          >
            {t('clients:backToClients')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(214, 78, 56, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg style={{ width: '24px', height: '24px', color: '#d64e38' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', letterSpacing: '-0.025em', margin: 0 }}>
                {t('clients:registerTitle')}
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '2px 0 0 0' }}>
                {t('clients:registerSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 24px -8px rgba(0,0,0,0.08)', border: '1px solid #f0ebe7', overflow: 'hidden' }}>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ padding: '32px 40px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', marginBottom: '32px', marginTop: 0 }}>
                {t('clients:personalInfo')}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '576px', margin: '0 auto' }}>
                {/* Name */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="name" style={labelStyle}>
                    {t('clients:name')} <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    id="name" type="text" required autoComplete="name"
                    placeholder="João Silva"
                    {...getFieldProps('name')}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#d64e38'; e.target.style.boxShadow = '0 0 0 3px rgba(214, 78, 56, 0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Email */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="email" style={labelStyle}>
                    {t('clients:email')} <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    id="email" type="email" required autoComplete="email"
                    placeholder="joao@exemplo.com"
                    {...getFieldProps('email')}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#d64e38'; e.target.style.boxShadow = '0 0 0 3px rgba(214, 78, 56, 0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" style={labelStyle}>
                    {t('clients:phoneLabel')}
                  </label>
                  <input
                    id="phone" type="tel" autoComplete="tel"
                    placeholder="(11) 99999-9999"
                    {...getFieldProps('phone')}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#d64e38'; e.target.style.boxShadow = '0 0 0 3px rgba(214, 78, 56, 0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" style={labelStyle}>
                    {t('clients:passwordLabel')} <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    id="password" type="password" required autoComplete="new-password" minLength={6}
                    placeholder="Mínimo de 6 caracteres"
                    {...getFieldProps('password')}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = '#d64e38'; e.target.style.boxShadow = '0 0 0 3px rgba(214, 78, 56, 0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '20px 40px', backgroundColor: 'rgba(249, 250, 251, 0.8)', borderTop: '1px solid #f0ebe7', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                <span style={{ color: '#f87171' }}>*</span> {t('clients:requiredFields')}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/clients')}
                  style={{ padding: '10px 24px', fontSize: '13px', fontWeight: 500, color: '#374151', backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                >
                  {t('clients:cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ padding: '10px 32px', fontSize: '13px', fontWeight: 700, color: '#fff', backgroundColor: '#d64e38', border: 'none', borderRadius: '12px', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 6px -1px rgba(214, 78, 56, 0.2)', transition: 'all 0.15s', opacity: isLoading ? 0.5 : 1, pointerEvents: isLoading ? 'none' : 'auto' }}
                  onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.filter = 'brightness(0.9)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
                >
                  {isLoading ? (
                    <span>{t('clients:saving')}</span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('clients:submitButton')}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

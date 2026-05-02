import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appointmentService } from '../../services/appointmentService';
import { useFormValidation } from '../../hooks/useFormValidation';
import StepIndicator from '../../components/ui/StepIndicator';

export default function PublicBookForm() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('public');
  const { date: selectedDate, time: selectedTime } = (location.state as { date?: string; time?: string }) || {};

  const [error, setError] = useState('');

  const {
    values: formData,
    errors: formErrors,
    getFieldProps,
    validateForm,
    handleChange,
  } = useFormValidation(
    {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      duration: 60,
      title: '',
      description: '',
      location: '',
    },
    {
      clientName: { required: true, minLength: 2, maxLength: 100 },
      clientEmail: { required: true, email: true },
      clientPhone: { maxLength: 20 },
      duration: { required: true, min: 5, max: 480 },
      title: { maxLength: 200 },
      description: { maxLength: 1000 },
      location: { maxLength: 200 },
    }
  );

  const [focusMap, setFocusMap] = useState<Record<string, boolean>>({});
  const handleFocus = (name: string) => setFocusMap((m) => ({ ...m, [name]: true }));
  const handleBlur = (name: string) => setFocusMap((m) => ({ ...m, [name]: false }));
  const [hoverBtn, setHoverBtn] = useState<string | null>(null);

  if (!selectedDate || !selectedTime) {
    navigate(`/book/${providerId}`, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!providerId) {
      setError(t('providerNotFound'));
      return;
    }

    if (!validateForm()) {
      setError(t('fixFormErrors'));
      return;
    }

    const durationNum = typeof formData.duration === 'number' ? formData.duration : parseInt(String(formData.duration), 10) || 60;

    try {
      const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
      const appointment = await appointmentService.createPublicAppointment({
        providerId,
        startTime: startDateTime.toISOString(),
        duration: durationNum,
        clientName: formData.clientName.trim(),
        clientEmail: formData.clientEmail.trim(),
        clientPhone: formData.clientPhone?.trim() || undefined,
        title: formData.title?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        location: formData.location?.trim() || undefined,
      });

      navigate(`/confirm/${appointment.publicToken}`);
    } catch (err: any) {
      setError(err.response?.data?.error || t('createError'));
    }
  };

  const inputStyle = (name: string) => {
    const hasError = !!formErrors[name];
    const isFocused = !!focusMap[name];
    return {
      width: '100%',
      padding: '14px 16px',
      backgroundColor: '#f9fafb',
      fontSize: '15px',
      color: '#1f2937',
      borderRadius: '12px',
      border: hasError ? '1.5px solid #ef4444' : isFocused ? '1.5px solid #d64e38' : '1.5px solid #e5e7eb',
      boxShadow: hasError ? '0 0 0 3px rgba(239,68,68,0.15)' : isFocused ? '0 0 0 3px rgba(214,78,56,0.15)' : 'none',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxSizing: 'border-box' as const,
    };
  };

  const labelStyle = {
    display: 'block' as const,
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  };

  const errorTextStyle = {
    marginTop: '4px',
    fontSize: '13px',
    color: '#dc2626',
  };

  const pageStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #fef6f2, #f9fafb)',
  };

  const containerStyle = {
    maxWidth: '576px',
    margin: '0 auto',
    padding: '40px 24px',
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #f0ebe7',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 24px -8px rgba(0,0,0,0.08)',
    padding: '32px',
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ marginBottom: '40px' }}>
          <StepIndicator
            currentStep={2}
            steps={[t('stepProfessional'), t('stepDateTime'), t('stepYourData')]}
          />
        </div>

        <section style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
            {t('yourData')}
          </h1>
        </section>

        {error && (
          <div style={{
            marginBottom: '32px',
            padding: '16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '12px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <div style={cardStyle}>
          {/* Data/hora selecionados */}
          <div style={{
            background: 'rgba(214,78,56,0.05)',
            border: '1px solid rgba(214,78,56,0.1)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '32px',
          }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 4px 0',
            }}>
              {t('selectedDateTime')}
            </p>
            <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: '15px' }}>
              {new Date(selectedDate).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{' '}
              {t('at')} {selectedTime}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>{t('yourName')}</label>
              <input
                type="text"
                placeholder={t('yourNamePlaceholder')}
                {...getFieldProps('clientName')}
                onFocus={() => handleFocus('clientName')}
                onBlur={() => handleBlur('clientName')}
                style={inputStyle('clientName')}
                required
              />
              {formErrors.clientName && <p style={errorTextStyle}>{formErrors.clientName}</p>}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>{t('yourEmail')}</label>
              <input
                type="email"
                placeholder={t('yourEmailPlaceholder')}
                {...getFieldProps('clientEmail')}
                onFocus={() => handleFocus('clientEmail')}
                onBlur={() => handleBlur('clientEmail')}
                style={inputStyle('clientEmail')}
                required
              />
              {formErrors.clientEmail && <p style={errorTextStyle}>{formErrors.clientEmail}</p>}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>{t('yourPhone')}</label>
              <input
                type="tel"
                placeholder={t('yourPhonePlaceholder')}
                {...getFieldProps('clientPhone')}
                onFocus={() => handleFocus('clientPhone')}
                onBlur={() => handleBlur('clientPhone')}
                style={inputStyle('clientPhone')}
              />
              {formErrors.clientPhone && <p style={errorTextStyle}>{formErrors.clientPhone}</p>}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>{t('duration')}</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value, 10) || 60)}
                onFocus={() => handleFocus('duration')}
                onBlur={() => handleBlur('duration')}
                min={5}
                max={480}
                style={inputStyle('duration')}
                required
              />
              {formErrors.duration && <p style={errorTextStyle}>{formErrors.duration}</p>}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>{t('title')}</label>
              <input
                type="text"
                {...getFieldProps('title')}
                onFocus={() => handleFocus('title')}
                onBlur={() => handleBlur('title')}
                style={inputStyle('title')}
              />
              {formErrors.title && <p style={errorTextStyle}>{formErrors.title}</p>}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>{t('description')}</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                onFocus={() => handleFocus('description')}
                onBlur={() => handleBlur('description')}
                placeholder={t('descriptionPlaceholder')}
                style={{
                  ...inputStyle('description'),
                  minHeight: '80px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
              {formErrors.description && <p style={errorTextStyle}>{formErrors.description}</p>}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>{t('location')}</label>
              <input
                type="text"
                placeholder={t('locationPlaceholder')}
                {...getFieldProps('location')}
                onFocus={() => handleFocus('location')}
                onBlur={() => handleBlur('location')}
                style={inputStyle('location')}
              />
              {formErrors.location && <p style={errorTextStyle}>{formErrors.location}</p>}
            </div>

            <div style={{ display: 'flex', gap: '16px', paddingTop: '24px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: hoverBtn === 'submit' ? '#b83d2a' : '#d64e38',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={() => setHoverBtn('submit')}
                onMouseLeave={() => setHoverBtn(null)}
              >
                {t('confirmAppointment')}
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '10px 24px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: hoverBtn === 'back' ? '#f9fafb' : '#fff',
                  color: '#374151',
                  border: '1.5px solid #d1d5db',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={() => setHoverBtn('back')}
                onMouseLeave={() => setHoverBtn(null)}
                onClick={() => navigate(`/book/${providerId}`)}
              >
                {t('back')}
              </button>
            </div>
          </form>
        </div>

        {/* Rodapé — Voltar */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #f0ebe7', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => navigate(`/book/${providerId}`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: 500,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#d64e38')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('back')}
          </button>
        </div>
      </div>
    </div>
  );
}

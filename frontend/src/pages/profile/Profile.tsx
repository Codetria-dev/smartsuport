import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { Profile as ProfileType } from '../../types/auth.types';
import { useToast } from '../../contexts/ToastContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation('profile');
  const { success, error: showError } = useToast();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    profileDescription: '',
  });

  const role = user?.role != null ? String(user.role).toUpperCase() : '';
  const isProvider = role === 'PROVIDER' || role === 'ADMIN';

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        profileDescription: profile.profileDescription ?? '',
      });
    }
  }, [profile]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await authService.getProfile();
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim() || form.name.trim().length < 2) {
      showError(t('nameMinError'));
      return;
    }
    if (!form.email.trim()) {
      showError(t('emailRequired'));
      return;
    }
    try {
      setSaving(true);
      const payload: Record<string, string | undefined> = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || undefined,
      };
      if (isProvider) {
        payload.profileDescription = form.profileDescription?.trim() || undefined;
      }
      const updated = await authService.updateProfile(payload);
      setProfile(updated);
      updateUser({
        ...user,
        ...updated,
        role: (updated.role as typeof user.role) ?? user.role,
        profileDescription: updated.profileDescription,
        isProfileActive: updated.isProfileActive,
      });
      success(t('saved'));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string; details?: { message?: string }[] } }; message?: string })?.response?.data?.error ||
        (err as { response?: { data?: { details?: { message?: string }[] } } })?.response?.data?.details?.[0]?.message ||
        (err as { message?: string })?.message ||
        t('updateError');
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const [focusMap, setFocusMap] = useState<Record<string, boolean>>({});
  const handleFocus = (name: string) => setFocusMap((m) => ({ ...m, [name]: true }));
  const handleBlur = (name: string) => setFocusMap((m) => ({ ...m, [name]: false }));
  const [hoverBtn, setHoverBtn] = useState(false);

  if (!user) return null;

  const userRole = user.role != null ? String(user.role).toUpperCase() : '';
  const roleLabel =
    userRole === 'ADMIN'
      ? t('administrator')
      : userRole === 'PROVIDER'
        ? t('professional')
        : t('client');

  const inputStyle = (name: string) => ({
    width: '100%' as const,
    padding: '14px 16px',
    backgroundColor: '#f9fafb',
    fontSize: '15px',
    color: '#1f2937',
    borderRadius: '12px',
    border: focusMap[name] ? '1.5px solid #d64e38' : '1.5px solid #e5e7eb',
    boxShadow: focusMap[name] ? '0 0 0 3px rgba(214,78,56,0.15)' : 'none',
    outline: 'none' as const,
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box' as const,
  });

  const textareaStyle = (name: string) => ({
    ...inputStyle(name),
    minHeight: '120px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  });

  const labelStyle = {
    display: 'block' as const,
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06), 0 12px 24px -8px rgba(0,0,0,0.08)',
    border: '1px solid #f0ebe7',
    padding: '32px',
  };

  const pageStyle = {
    width: '100%',
    background: 'linear-gradient(to bottom, #fef6f2, #f9fafb)',
    minHeight: '60vh',
    paddingBottom: '48px',
  };

  const containerStyle = {
    maxWidth: '720px',
    margin: '0 auto',
    marginTop: '40px',
    padding: '0 16px',
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={{ ...cardStyle, display: 'flex', justifyContent: 'center', padding: '64px 32px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '2px solid #d64e38',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <form onSubmit={handleSubmit} style={cardStyle}>
          {/* Header */}
          <header>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d64e38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111827', margin: 0 }}>
                {t('pageTitle')}
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 24px 0' }}>
              {t('subtitle')}
            </p>
          </header>

          {/* Seção 1 — Informações */}
          <section style={{ paddingTop: '4px' }}>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>{t('fullName')}</label>
              <input
                type="text"
                value={form.name}
                onFocus={() => handleFocus('name')}
                onBlur={() => handleBlur('name')}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={inputStyle('name')}
                required
                minLength={2}
                maxLength={100}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>{t('email')}</label>
              <input
                type="email"
                value={form.email}
                onFocus={() => handleFocus('email')}
                onBlur={() => handleBlur('email')}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                style={inputStyle('email')}
                required
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>{t('phone')}</label>
              <input
                type="tel"
                value={form.phone}
                onFocus={() => handleFocus('phone')}
                onBlur={() => handleBlur('phone')}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                style={inputStyle('phone')}
                maxLength={20}
              />
            </div>

            {isProvider && (
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>{t('presentationCard')}</label>
                <textarea
                  value={form.profileDescription}
                  onFocus={() => handleFocus('profileDescription')}
                  onBlur={() => handleBlur('profileDescription')}
                  onChange={(e) => setForm((f) => ({ ...f, profileDescription: e.target.value }))}
                  style={textareaStyle('profileDescription')}
                  placeholder={t('presentationCardPlaceholder')}
                  maxLength={2000}
                  rows={4}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  {form.profileDescription.length}/2000
                </p>
              </div>
            )}
          </section>

          {/* Seção 2 — Conta */}
          <section style={{ borderTop: '1px solid #f0ebe7', marginTop: '32px', paddingTop: '32px' }}>
            <label style={labelStyle}>{t('accountType')}</label>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 500,
                background:
                  userRole === 'ADMIN'
                    ? '#f3e8ff'
                    : userRole === 'PROVIDER'
                      ? '#dcfce7'
                      : '#e5e7eb',
                color:
                  userRole === 'ADMIN'
                    ? '#7c3aed'
                    : userRole === 'PROVIDER'
                      ? '#16a34a'
                      : '#374151',
              }}
            >
              {roleLabel}
            </span>
          </section>

          {/* Seção 3 — Ações */}
          <section style={{ borderTop: '1px solid #f0ebe7', marginTop: '32px', paddingTop: '32px', display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: hoverBtn ? '#b83d2a' : '#d64e38',
                color: '#fff',
                padding: '10px 32px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                borderRadius: '10px',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.5 : 1,
                transition: 'background 0.2s',
                minHeight: '44px',
              }}
              onMouseEnter={() => setHoverBtn(true)}
              onMouseLeave={() => setHoverBtn(false)}
            >
              {saving ? t('saving') : t('save')}
            </button>
            <Link
              to="/forgot-password"
              style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}
            >
              {t('changePassword')}
            </Link>
          </section>
        </form>
      </div>
    </div>
  );
}

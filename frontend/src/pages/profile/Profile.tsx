import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { Profile as ProfileType } from '../../types/auth.types';
import { useToast } from '../../contexts/ToastContext';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
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

  if (!user) return null;

  const userRole = user.role != null ? String(user.role).toUpperCase() : '';
  const roleLabel =
    userRole === 'ADMIN'
      ? t('administrator')
      : userRole === 'PROVIDER'
        ? t('professional')
        : t('client');


  if (loading) {
    return (
      <div className="w-full bg-gray-50 min-h-[60vh] pb-12">
        <div className="max-w-[720px] mx-auto mt-10 px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-[60vh] pb-12">
      <div className="max-w-[720px] mx-auto mt-10 px-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          {/* Header */}
          <header>
            <h1 className="text-2xl font-semibold text-gray-900">{t('pageTitle')}</h1>
            <p className="text-sm text-gray-500 mt-1 mb-6">{t('subtitle')}</p>
          </header>

          {/* Seção 1 — Informações */}
          <section className="space-y-5 pt-1">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('fullName')}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                required
                minLength={2}
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('email')}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('phone')}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                maxLength={20}
              />
            </div>

            {isProvider && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{t('presentationCard')}</label>
                <textarea
                  value={form.profileDescription}
                  onChange={(e) => setForm((f) => ({ ...f, profileDescription: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder={t('presentationCardPlaceholder')}
                  maxLength={2000}
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">{form.profileDescription.length}/2000</p>
              </div>
            )}
          </section>

          {/* Seção 2 — Conta */}
          <section className="border-t border-gray-100 mt-8 pt-8">
            <label className="text-sm font-medium text-gray-700 mb-1 block">{t('accountType')}</label>
            <span
              className={
                userRole === 'ADMIN'
                  ? 'px-3 py-1 rounded-full text-sm inline-block bg-purple-100 text-purple-700'
                  : userRole === 'PROVIDER'
                    ? 'px-3 py-1 rounded-full text-sm inline-block bg-green-100 text-green-700'
                    : 'px-3 py-1 rounded-full text-sm inline-block bg-gray-200 text-gray-700'
              }
            >
              {roleLabel}
            </span>
            {!isProvider && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  {t('clientNotInList')}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="font-medium underline hover:no-underline"
                  >
                    sair da conta
                  </button>
                  , depois clique em &quot;{t('createProAccount')}&quot;.
                </p>
              </div>
            )}
            {isProvider && (
              <p className="mt-4 text-sm text-gray-500">
                {t('profileVisibleAt')}{' '}
                <Link to="/select-provider" className="text-gray-900 font-medium underline hover:text-gray-700">
                  {t('seeMyProfile')} →
                </Link>
              </p>
            )}
          </section>

          {/* Seção 3 — Ações */}
          <section className="border-t border-gray-100 mt-8 pt-8 flex gap-4 items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? t('saving') : t('save')}
            </button>
            <Link
              to="/forgot-password"
              className="text-gray-600 text-sm hover:text-gray-900 transition-colors"
            >
              {t('changePassword')}
            </Link>
          </section>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import './home-landing.css';

import preview1 from '../../assets/pexels-arina-krasnikova-5712576.jpg';
import preview2 from '../../assets/pexels-ekaterina-bolovtsova-6193328.jpg';
import preview3 from '../../assets/pexels-planka-28353120.jpg';
import preview4 from '../../assets/pexels-thepaintedsquare-583846.jpg';

const previewImages = [preview1, preview2, preview3, preview4];
const AUTOPLAY_MS = 4500;

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation('home');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % previewImages.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, []);

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div data-landing="true" className="flex-1 flex flex-col w-full">
      {/* 1. Hero — título grande, subtítulo, botões, muito espaço vertical */}
      <section className="bg-white w-full">
        <div className="max-w-4xl mx-auto text-center px-4 py-24 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            {t('heroTitle')}
          </h1>
          <p className="text-lg text-gray-600 landing-hero-subtitle">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center landing-hero-ctas">
            <button
              type="button"
              onClick={() => navigate('/select-provider')}
              className="btn-landing-primary"
            >
              {t('heroCtaPrimary')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/register?role=provider')}
              className="btn-landing-secondary"
            >
              {t('heroCtaSecondary')}
            </button>
          </div>
        </div>
      </section>

      {/* 2. Dashboard Preview — carousel */}
      <section className="w-full bg-gray-50 pb-16" aria-label={t('ariaPreviewSection')}>
        <div className="max-w-4xl mx-auto mt-16 px-4">
          <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-100 max-h-[280px]">
            <div
              className="flex transition-transform duration-500 ease-out h-[280px]"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {previewImages.map((src, i) => (
                <div
                  key={i}
                  className="min-w-full h-full overflow-hidden flex-shrink-0"
                >
                  <img
                    src={src}
                    alt={t('ariaProductPreview', { n: i + 1 })}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            {/* Botões anterior / próximo */}
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((i) =>
                  i === 0 ? previewImages.length - 1 : i - 1
                )
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
              aria-label={t('ariaPreviousPhoto')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((i) => (i + 1) % previewImages.length)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
              aria-label={t('ariaNextPhoto')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {previewImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === currentIndex
                      ? 'bg-white shadow'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={t('ariaGoToPhoto', { n: i + 1 })}
                  aria-current={i === currentIndex ? 'true' : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stats — grid grid-cols-2 md:grid-cols-4 gap-8 text-center py-16 */}
      <section className="bg-white py-16" aria-label={t('ariaStatistics')}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-900">10K+</p>
              <p className="text-gray-500 text-sm mt-1">{t('statUsers')}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">50K+</p>
              <p className="text-gray-500 text-sm mt-1">{t('statAppointments')}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">99.9%</p>
              <p className="text-gray-500 text-sm mt-1">{t('statUptime')}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">4.8/5</p>
              <p className="text-gray-500 text-sm mt-1">{t('statRating')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features — max-w-6xl mx-auto py-16, cards altura igual */}
      <section className="bg-gray-50 py-16" aria-label={t('ariaFeatures')}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <article className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition h-full flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('benefit1Title')}</h3>
              <p className="text-gray-500 text-sm flex-1">{t('benefit1Desc')}</p>
            </article>
            <article className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition h-full flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('benefit2Title')}</h3>
              <p className="text-gray-500 text-sm flex-1">{t('benefit2Desc')}</p>
            </article>
            <article className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition h-full flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('benefit3Title')}</h3>
              <p className="text-gray-500 text-sm flex-1">{t('benefit3Desc')}</p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA final — fundo claro, py-16 */}
      <section className="bg-white py-16" aria-label={t('ariaCallToAction')}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('ctaTitle')}</h2>
          <p className="text-gray-500 text-sm landing-cta-subtitle">{t('ctaSubtitle')}</p>
          <div className="flex flex-col sm:flex-row justify-center landing-cta-buttons">
            <button
              type="button"
              onClick={() => navigate('/select-provider')}
              className="btn-landing-primary"
            >
              {t('ctaPrimary')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/register?role=provider')}
              className="btn-landing-secondary"
            >
              {t('ctaSecondary')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

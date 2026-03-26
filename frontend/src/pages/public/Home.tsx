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
    <div data-landing="true" className="landing-page">
      <section className="landing-section landing-section--hero">
        <div className="landing-shell">
          <div className="landing-hero-copy">
            <h1 className="landing-hero-title">{t('heroTitle')}</h1>
            <p className="landing-hero-subtitle">{t('heroSubtitle')}</p>
            <div className="landing-hero-ctas">
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
        </div>
      </section>

      <section className="landing-section landing-section--preview" aria-label={t('ariaPreviewSection')}>
        <div className="landing-shell">
          <div className="landing-carousel">
            <div
              className="landing-carousel-track"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {previewImages.map((src, i) => (
                <div key={i} className="landing-carousel-slide">
                  <img src={src} alt={t('ariaProductPreview', { n: i + 1 })} />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((i) => (i === 0 ? previewImages.length - 1 : i - 1))
              }
              className="landing-carousel-nav landing-carousel-nav--prev"
              aria-label={t('ariaPreviousPhoto')}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setCurrentIndex((i) => (i + 1) % previewImages.length)}
              className="landing-carousel-nav landing-carousel-nav--next"
              aria-label={t('ariaNextPhoto')}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="landing-carousel-dots">
              {previewImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`landing-carousel-dot${i === currentIndex ? ' is-active' : ''}`}
                  aria-label={t('ariaGoToPhoto', { n: i + 1 })}
                  aria-current={i === currentIndex ? 'true' : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--stats" aria-label={t('ariaStatistics')}>
        <div className="landing-shell">
          <div className="landing-stats-grid">
            <div>
              <p className="landing-stat-value">10K+</p>
              <p className="landing-stat-label">{t('statUsers')}</p>
            </div>
            <div>
              <p className="landing-stat-value">50K+</p>
              <p className="landing-stat-label">{t('statAppointments')}</p>
            </div>
            <div>
              <p className="landing-stat-value">99.9%</p>
              <p className="landing-stat-label">{t('statUptime')}</p>
            </div>
            <div>
              <p className="landing-stat-value">4.8/5</p>
              <p className="landing-stat-label">{t('statRating')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--features" aria-label={t('ariaFeatures')}>
        <div className="landing-shell">
          <div className="landing-features-grid">
            <article className="landing-feature-card">
              <h3 className="landing-feature-title">{t('benefit1Title')}</h3>
              <p className="landing-feature-desc">{t('benefit1Desc')}</p>
            </article>
            <article className="landing-feature-card">
              <h3 className="landing-feature-title">{t('benefit2Title')}</h3>
              <p className="landing-feature-desc">{t('benefit2Desc')}</p>
            </article>
            <article className="landing-feature-card">
              <h3 className="landing-feature-title">{t('benefit3Title')}</h3>
              <p className="landing-feature-desc">{t('benefit3Desc')}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--cta" aria-label={t('ariaCallToAction')}>
        <div className="landing-shell">
          <div className="landing-cta-copy">
            <h2 className="landing-cta-title">{t('ctaTitle')}</h2>
            <p className="landing-cta-subtitle">{t('ctaSubtitle')}</p>
            <div className="landing-cta-buttons">
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
        </div>
      </section>
    </div>
  );
}

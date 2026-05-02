import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useCarousel } from '../../hooks/useCarousel';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './home-landing.css';

import preview1 from '../../assets/pexels-arina-krasnikova-5712576.jpg';
import preview2 from '../../assets/pexels-ekaterina-bolovtsova-6193328.jpg';
import preview3 from '../../assets/pexels-planka-28353120.jpg';
import preview4 from '../../assets/pexels-thepaintedsquare-583846.jpg';

const previewImages = [preview1, preview2, preview3, preview4];

/* Ícones SVG inline para cada feature (evita dependências externas) */
function CalendarIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function DevicesIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, enterDemo } = useAuth();
  const { t } = useTranslation('home');
  const { currentIndex, goTo, goNext, goPrev, pause, resume } = useCarousel(previewImages.length, 5000);

  const heroReveal = useScrollReveal({ threshold: 0.1 });
  const carouselReveal = useScrollReveal({ threshold: 0.1 });
  const statsReveal = useScrollReveal({ threshold: 0.15 });
  const featuresReveal = useScrollReveal({ threshold: 0.1 });
  const ctaReveal = useScrollReveal({ threshold: 0.1 });

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div data-landing="true" className="landing-page">
      {/* ===== Hero ===== */}
      <section className="landing-section landing-section--hero" aria-label="Hero">
        <div className="landing-shell">
          <div className="landing-hero-copy">
            <div
              ref={heroReveal.ref}
              className={`landing-reveal${heroReveal.isVisible ? ' is-visible' : ''}`}
            >
              <div className="landing-hero-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t('heroBadge', 'Smart Support')}
              </div>
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
                  onClick={() => navigate('/register')}
                  className="btn-landing-secondary"
                >
                  {t('heroCtaSecondary')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    enterDemo();
                    navigate('/dashboard');
                  }}
                  className="btn-landing-secondary"
                  style={{ borderColor: '#9ca3af' }}
                >
                  {t('viewDemo')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Carrossel ===== */}
      <section className="landing-section landing-section--preview" aria-label={t('ariaPreviewSection')}>
        <div className="landing-shell">
          <div
            ref={carouselReveal.ref}
            className={`landing-reveal${carouselReveal.isVisible ? ' is-visible' : ''}`}
          >
            <div
              className="landing-carousel"
              onMouseEnter={pause}
              onMouseLeave={resume}
              onFocus={pause}
              onBlur={resume}
            >
              <div
                className="landing-carousel-track"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {previewImages.map((src, i) => (
                  <div key={i} className="landing-carousel-slide">
                    <img
                      src={src}
                      alt={t('ariaProductPreview', { n: i + 1 })}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
              <div className="landing-carousel-overlay" aria-hidden />

              <button
                type="button"
                onClick={goPrev}
                className="landing-carousel-nav landing-carousel-nav--prev"
                aria-label={t('ariaPreviousPhoto')}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
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
                    onClick={() => goTo(i)}
                    className={`landing-carousel-dot${i === currentIndex ? ' is-active' : ''}`}
                    aria-label={t('ariaGoToPhoto', { n: i + 1 })}
                    aria-current={i === currentIndex ? 'true' : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Estatísticas ===== */}
      <section className="landing-section landing-section--stats" aria-label={t('ariaStatistics')}>
        <div className="landing-shell">
          <div
            ref={statsReveal.ref}
            className={`landing-reveal${statsReveal.isVisible ? ' is-visible' : ''}`}
          >
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
        </div>
      </section>

      {/* ===== Benefícios ===== */}
      <section className="landing-section landing-section--features" aria-label={t('ariaFeatures')}>
        <div className="landing-shell">
          <div
            ref={featuresReveal.ref}
            className={`landing-reveal${featuresReveal.isVisible ? ' is-visible' : ''}`}
          >
            <div className="landing-features-grid">
              <article className="landing-feature-card">
                <div className="landing-feature-icon">
                  <CalendarIcon />
                </div>
                <h3 className="landing-feature-title">{t('benefit1Title')}</h3>
                <p className="landing-feature-desc">{t('benefit1Desc')}</p>
              </article>
              <article className="landing-feature-card">
                <div className="landing-feature-icon">
                  <BellIcon />
                </div>
                <h3 className="landing-feature-title">{t('benefit2Title')}</h3>
                <p className="landing-feature-desc">{t('benefit2Desc')}</p>
              </article>
              <article className="landing-feature-card">
                <div className="landing-feature-icon">
                  <DevicesIcon />
                </div>
                <h3 className="landing-feature-title">{t('benefit3Title')}</h3>
                <p className="landing-feature-desc">{t('benefit3Desc')}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA final ===== */}
      <section className="landing-section landing-section--cta" aria-label={t('ariaCallToAction')}>
        <div className="landing-shell">
          <div
            ref={ctaReveal.ref}
            className={`landing-reveal${ctaReveal.isVisible ? ' is-visible' : ''}`}
          >
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

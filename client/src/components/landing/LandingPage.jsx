import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaBolt,
    FaQrcode,
    FaLink,
    FaTrophy,
    FaUserGroup,
    FaSliders,
    FaWifi,
    FaGlobe,
    FaGithub,
    FaPaypal,
    FaLanguage,
    FaCheck,
} from 'react-icons/fa6';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

function LandingPage({ authenticated = false }) {
    const { t, language, languages, setLanguage } = useLanguage();
    const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
    const languageMenuRef = useRef(null);
    const playTo = authenticated ? '/app' : '/jouer';
    const playLabel = authenticated ? t('landing.openApp') : t('landing.play');
    const finalLabel = authenticated ? t('landing.backToPlay') : t('landing.createProfile');
    const finalLead = authenticated ? t('landing.ctaAuth') : t('landing.ctaGuest');
    const currentLanguageLabel = languages.find((item) => item.code === language)?.nativeLabel || language;

    const steps = [
        { title: t('landing.step1Title'), text: t('landing.step1Text') },
        { title: t('landing.step2Title'), text: t('landing.step2Text') },
        { title: t('landing.step3Title'), text: t('landing.step3Text') },
    ];

    const features = [
        { Icon: FaBolt, title: t('landing.f1Title'), text: t('landing.f1Text') },
        { Icon: FaTrophy, title: t('landing.f2Title'), text: t('landing.f2Text') },
        { Icon: FaLink, title: t('landing.f3Title'), text: t('landing.f3Text') },
        { Icon: FaUserGroup, title: t('landing.f4Title'), text: t('landing.f4Text') },
        { Icon: FaSliders, title: t('landing.f5Title'), text: t('landing.f5Text') },
        { Icon: FaWifi, title: t('landing.f6Title'), text: t('landing.f6Text') },
        { Icon: FaGlobe, title: t('landing.f7Title'), text: t('landing.f7Text') },
        { Icon: FaQrcode, title: t('landing.f8Title'), text: t('landing.f8Text') },
    ];

    const scrollToMore = (event) => {
        event.preventDefault();
        document.getElementById('en-savoir-plus')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    useEffect(() => {
        if (!languageMenuOpen) {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (!languageMenuRef.current?.contains(event.target)) {
                setLanguageMenuOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setLanguageMenuOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [languageMenuOpen]);

    return (
        <div className="landing">
            <div className="landing-lang" ref={languageMenuRef}>
                <button
                    type="button"
                    className="landing-lang__button"
                    aria-haspopup="listbox"
                    aria-expanded={languageMenuOpen}
                    aria-label={t('profile.language')}
                    onClick={() => setLanguageMenuOpen((open) => !open)}
                >
                    <FaLanguage aria-hidden="true" />
                    <span>{currentLanguageLabel}</span>
                </button>
                {languageMenuOpen && (
                    <ul className="landing-lang__menu" role="listbox" aria-label={t('profile.language')}>
                        {languages.map((item) => {
                            const selected = item.code === language;
                            return (
                                <li key={item.code} role="option" aria-selected={selected}>
                                    <button
                                        type="button"
                                        className={`landing-lang__option${selected ? ' is-selected' : ''}`}
                                        onClick={() => {
                                            setLanguage(item.code);
                                            setLanguageMenuOpen(false);
                                        }}
                                    >
                                        <span>{item.nativeLabel}</span>
                                        {selected ? <FaCheck aria-hidden="true" /> : null}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <header className="landing-hero">
                <div className="landing-hero__content">
                    <img
                        className="landing-hero__logo"
                        src="/buzzer-app-logo-transparent.webp"
                        alt="Buzzer App, application buzzer en ligne"
                        width={220}
                        height={220}
                    />
                    <h1 className="landing-hero__title">{t('landing.title')}</h1>
                    <p className="landing-hero__lead">{t('landing.lead')}</p>
                    <div className="landing-hero__actions">
                        <Link to={playTo} className="btn-push btn-push-green landing-hero__cta">
                            {playLabel}
                        </Link>
                        <a
                            href="#en-savoir-plus"
                            className="btn-push btn-push-gray landing-hero__cta"
                            onClick={scrollToMore}
                        >
                            {t('landing.learnMore')}
                        </a>
                    </div>
                </div>
            </header>

            <main className="landing-main">
                <section
                    id="en-savoir-plus"
                    className="landing-section"
                    aria-labelledby="landing-how-title"
                >
                    <h2 id="landing-how-title" className="landing-section__title">{t('landing.howTitle')}</h2>
                    <p className="landing-section__lead">{t('landing.howLead')}</p>
                    <ol className="landing-steps">
                        {steps.map((step, index) => (
                            <li key={step.title} className="landing-steps__item">
                                <span className="landing-steps__index" aria-hidden="true">{index + 1}</span>
                                <div>
                                    <h3 className="landing-steps__title">{step.title}</h3>
                                    <p className="landing-steps__text">{step.text}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section
                    id="fonctionnalites"
                    className="landing-section landing-section--features"
                    aria-labelledby="landing-features-title"
                >
                    <h2 id="landing-features-title" className="landing-section__title">{t('landing.featuresTitle')}</h2>
                    <p className="landing-section__lead">{t('landing.featuresLead')}</p>
                    <ul className="landing-features">
                        {features.map(({ Icon, title, text }) => (
                            <li key={title} className="landing-features__item">
                                <span className="landing-features__icon-wrap" aria-hidden="true">
                                    <Icon className="landing-features__icon" />
                                </span>
                                <div>
                                    <h3 className="landing-features__title">{title}</h3>
                                    <p className="landing-features__text">{text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <section
                    className="landing-section landing-section--seo"
                    aria-labelledby="landing-seo-title"
                >
                    <h2 id="landing-seo-title" className="landing-section__title">{t('landing.seoTitle')}</h2>
                    <div className="landing-seo">
                        <p className="landing-seo__text">{t('landing.seoP1')}</p>
                        <p className="landing-seo__text">{t('landing.seoP2')}</p>
                        <p className="landing-seo__text">{t('landing.seoP3')}</p>
                    </div>
                </section>

                <section className="landing-section landing-section--cta" aria-labelledby="landing-cta-title">
                    <h2 id="landing-cta-title" className="landing-section__title">{t('landing.ctaTitle')}</h2>
                    <p className="landing-section__lead">{finalLead}</p>
                    <Link to={playTo} className="btn-push btn-push-green landing-hero__cta">
                        {finalLabel}
                    </Link>
                </section>
            </main>

            <footer className="landing-footer">
                <p className="landing-footer__credit">
                    {t('landing.madeBy')}{' '}
                    <a href="https://mondon.pro/projet/buzzer-app" target="_blank" rel="noreferrer">
                        Arthur Mondon
                    </a>
                </p>
                <div className="landing-footer__links">
                    <a
                        className="landing-footer__link"
                        href="https://github.com/arthur-mdn/buzzer-app"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <FaGithub aria-hidden="true" />
                        GitHub
                    </a>
                    <a
                        className="landing-footer__link"
                        href="https://www.paypal.com/paypalme/arthurmondon"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <FaPaypal aria-hidden="true" />
                        PayPal
                    </a>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;

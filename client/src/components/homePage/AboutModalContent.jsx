import { Link } from 'react-router-dom';
import { FaGithub, FaPaypal } from 'react-icons/fa6';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

function AboutModalContent() {
    const { t } = useLanguage();

    return (
        <>
            <div className="about-modal__text">
                <p>{t('about.p1')}</p>
                <p>{t('about.p2')}</p>
                <p>{t('about.p3')}</p>
                <p>{t('about.p4')}</p>
                <p>{t('about.p5')}</p>
                <p>
                    {t('about.credits')}{' '}
                    <a href="https://mondon.pro/projet/buzzer-app" target="_blank" rel="noreferrer">
                        {t('about.viewProject')}
                    </a>
                </p>
            </div>
            <div className="about-modal__links">
                <Link className="btn-push btn-push-gray about-modal__link" to="/">
                    {t('about.home')}
                </Link>
                <a
                    className="btn-push about-modal__link"
                    href="https://github.com/arthur-mdn/buzzer-app"
                    target="_blank"
                    rel="noreferrer"
                >
                    <FaGithub aria-hidden="true" />
                    GitHub
                </a>
                <a
                    className="btn-push btn-push-green about-modal__link"
                    href="https://www.paypal.com/paypalme/arthurmondon"
                    target="_blank"
                    rel="noreferrer"
                >
                    <FaPaypal aria-hidden="true" />
                    PayPal
                </a>
            </div>
        </>
    );
}

export default AboutModalContent;

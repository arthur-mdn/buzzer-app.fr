import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext.jsx';

function NotFound() {
    const { t } = useLanguage();

    return (
        <div className="game-wait game-wait--fullscreen">
            <div className="game-wait__card">
                <p className="game-wait__title">{t('notFound.title')}</p>
                <p className="game-wait__subtitle">{t('notFound.text')}</p>
                <Link to="/app" className="btn-push btn-push-green" style={{ padding: '0.75rem 1.5rem', marginTop: '0.5rem' }}>
                    {t('common.home')}
                </Link>
            </div>
        </div>
    );
}

export default NotFound;

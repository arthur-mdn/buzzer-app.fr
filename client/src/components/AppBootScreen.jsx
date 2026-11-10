import { useLanguage } from '../i18n/LanguageContext.jsx';

function AppBootScreen({ message }) {
    const { t } = useLanguage();
    const text = message || t('common.loadingWait');

    return (
        <div className="modal_bg">
            <div className="modal">
                <div className="modal_content_title">
                    <h2>{t('common.loading')}</h2>
                </div>
                <div className="modal_content">
                    <label style={{ width: '100%', textAlign: 'center' }}>{text}</label>
                </div>
            </div>
        </div>
    );
}

export default AppBootScreen;

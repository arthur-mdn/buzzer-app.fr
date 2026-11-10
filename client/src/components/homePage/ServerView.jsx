import { useState } from 'react';
import UserHistory from './UserHistory.jsx';
import PublicServerList from './PublicServerList.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

function ServerView() {
    const { t } = useLanguage();
    const [serverActiveTab, setServerActiveTab] = useState('history');

    const renderServerTab = () => {
        switch (serverActiveTab) {
            case 'history':
                return <UserHistory />;
            case 'public':
                return <PublicServerList />;
            default:
                return null;
        }
    };

    return (
        <div className="tab-screen salons-view">
            <div className="salons-panel">
                <h2 className="salons-panel__title">{t('salons.title')}</h2>
                <div className="salons-panel__shell">
                    <div className="salons-panel__tabs" role="tablist" aria-label={t('salons.title')}>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={serverActiveTab === 'history'}
                            onClick={() => setServerActiveTab('history')}
                            className={`salons-panel__tab${serverActiveTab === 'history' ? ' active' : ''}`}
                        >
                            {t('salons.history')}
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={serverActiveTab === 'public'}
                            onClick={() => setServerActiveTab('public')}
                            className={`salons-panel__tab${serverActiveTab === 'public' ? ' active' : ''}`}
                        >
                            {t('salons.public')}
                        </button>
                    </div>
                    <div className="salons-panel__body" role="tabpanel">
                        {renderServerTab()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ServerView;

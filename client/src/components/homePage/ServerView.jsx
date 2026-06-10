import { useState } from 'react';
import { useUser } from '../../UserContext.jsx';
import UserHistory from './UserHistory.jsx';
import PublicServerList from './PublicServerList.jsx';
import AdminServerList from './AdminServerList.jsx';

function ServerView() {
    const { userRole } = useUser();
    const [serverActiveTab, setServerActiveTab] = useState('history');

    const renderServerTab = () => {
        switch (serverActiveTab) {
            case 'history':
                return <UserHistory />;
            case 'public':
                return <PublicServerList />;
            case 'admin':
                return userRole === 'admin' ? <AdminServerList /> : null;
            default:
                return null;
        }
    };

    return (
        <div className="tab-screen salons-view">
            <div className="salons-panel">
                <h2 className="salons-panel__title">Salons</h2>
                <div className="salons-panel__shell">
                    <div className="salons-panel__tabs" role="tablist" aria-label="Type de salons">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={serverActiveTab === 'history'}
                            onClick={() => setServerActiveTab('history')}
                            className={`salons-panel__tab${serverActiveTab === 'history' ? ' active' : ''}`}
                        >
                            Historique
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={serverActiveTab === 'public'}
                            onClick={() => setServerActiveTab('public')}
                            className={`salons-panel__tab${serverActiveTab === 'public' ? ' active' : ''}`}
                        >
                            Public
                        </button>
                        {userRole === 'admin' && (
                            <button
                                type="button"
                                role="tab"
                                aria-selected={serverActiveTab === 'admin'}
                                onClick={() => setServerActiveTab('admin')}
                                className={`salons-panel__tab${serverActiveTab === 'admin' ? ' active' : ''}`}
                            >
                                Admin
                            </button>
                        )}
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

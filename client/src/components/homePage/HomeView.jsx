import { useState } from 'react';
import config from '../../config';
import Host from '../host/Host.jsx';
import Join from '../player/Join.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

function HomeView() {
    const { t } = useLanguage();
    const [hostModalIsOpen, setHostModalIsOpen] = useState(false);
    const [joinModalIsOpen, setJoinModalIsOpen] = useState(false);

    return (
        <>
            {hostModalIsOpen && <Host onClose={() => setHostModalIsOpen(false)} />}
            {joinModalIsOpen && <Join onClose={() => setJoinModalIsOpen(false)} />}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}>
                <img
                    src={`${config.instanceUrl}/buzzer-app-logo-transparent.webp`}
                    alt="Logo"
                    style={{
                        width: '100%',
                        maxWidth: '40vh',
                        objectFit: 'contain',
                        userSelect: 'none',
                        marginTop: '3rem',
                        aspectRatio: '1/1',
                    }}
                />
                <nav>
                    <ul style={{ listStyle: 'none', padding: '0' }}>
                        <li className="btn-push btn-push-green" onClick={() => setHostModalIsOpen(true)}>
                            {t('home.create')}
                        </li>
                        <br />
                        <li className="btn-push btn-push-green" onClick={() => setJoinModalIsOpen(true)}>
                            {t('home.join')}
                        </li>
                    </ul>
                </nav>
            </div>
        </>
    );
}

export default HomeView;

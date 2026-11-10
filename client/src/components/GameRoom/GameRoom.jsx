import React, { useEffect, useRef, useState } from 'react';
import HostGameRoom from './HostGameRoom.jsx';
import PlayerGameRoom from './PlayerGameRoom.jsx';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import PlayerList from './PlayerList.jsx';
import PlayerCount from './PlayerCount.jsx';
import { useSocket } from '../../SocketContext.jsx';
import { useUser } from '../../UserContext.jsx';
import { useToken } from '../../TokenContext.jsx';
import { GameProvider, useGame } from '../../GameContext.jsx';
import { FaUser } from 'react-icons/fa';
import RoomDetails from './RoomDetails.jsx';
import Modal from '../modal/Modal.jsx';
import ServerSettings from './ServerSettings.jsx';
import BlasonServerViewer from '../host/BlasonServerViewer.jsx';
import PingViewer from './PingViewer.jsx';

import config from '../../config.js';
import GameWaitMessage from './GameWaitMessage.jsx';
import GameFeedbackCard from './GameFeedbackCard.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

function ObserverPanel() {
    const { gameState, message, buzzOrder } = useGame();
    const { t } = useLanguage();
    const latest = buzzOrder?.[0];

    return (
        <div style={{ padding: '1.5rem 2rem' }}>
            <div className="game-wait">
                <div className="game-wait__card">
                    <p className="game-wait__title">{t('game.observerTitle')}</p>
                    <p className="game-wait__subtitle">
                        {t('game.observerSubtitle')}
                    </p>
                    <p className="game-wait__subtitle">{t('game.observerState', { status: t(`game.status.${gameState}`) })}</p>
                    {message && <p className="game-wait__subtitle">{message}</p>}
                    {latest && (
                        <p className="game-wait__subtitle">
                            {t('game.observerLastBuzz', { name: latest.userName })}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function GameRoom({ currentPing }) {
    const socket = useSocket();
    const { t } = useLanguage();
    const { userId, userRole } = useUser();
    const token = useToken();
    const { serverCode } = useParams();
    const [searchParams] = useSearchParams();
    const wantObserve = searchParams.get('observe') === '1';
    const isObserver = wantObserve && userRole === 'admin';

    const [role, setRole] = useState(null);
    const [serverInfo, setServerInfo] = useState(null);
    const [error, setError] = useState(null);
    const leaveInfoRef = useRef({ socket, userId, serverCode, isObserver: false });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        leaveInfoRef.current = { socket, userId, serverCode, isObserver };
    }, [socket, userId, serverCode, isObserver]);

    const emitLeave = () => {
        const {
            socket: currentSocket,
            userId: currentUserId,
            serverCode: currentServerCode,
            isObserver: observing,
        } = leaveInfoRef.current;
        if (!currentSocket || !currentServerCode) {
            return;
        }
        if (observing) {
            currentSocket.emit('unobserveServer', { serverCode: currentServerCode });
            return;
        }
        currentSocket.emit('userLeaving', { userId: currentUserId, serverCode: currentServerCode });
    };

    useEffect(() => {
        let cancelled = false;

        const fetchServerDetails = async () => {
            try {
                const response = await fetch(`${config.serverUrl}/server/${serverCode}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (cancelled) return;

                if (data.success) {
                    setServerInfo(data.server);
                    if (isObserver) {
                        setRole('observer');
                        socket.emit('observeServer', { serverCode });
                    } else {
                        setRole(data.role);
                        socket.emit('joinServer', { serverCode });
                    }
                } else {
                    setError('room.notFound');
                }
            } catch (err) {
                if (cancelled) return;
                console.error('There was an error fetching the server details:', err);
                setError('room.fetchError');
            }
        };

        if (wantObserve && userRole !== 'admin') {
            setError('room.observeAdminOnly');
            return undefined;
        }

        fetchServerDetails();

        return () => {
            cancelled = true;
        };
    }, [serverCode, socket, token, isObserver, wantObserve, userRole]);

    useEffect(() => {
        const rejoinServer = () => {
            if (!serverCode) {
                return;
            }
            if (isObserver) {
                socket.emit('observeServer', { serverCode });
            } else {
                socket.emit('joinServer', { serverCode });
            }
        };

        socket.on('socketIdUpdated', rejoinServer);
        return () => {
            socket.off('socketIdUpdated', rejoinServer);
        };
    }, [socket, serverCode, isObserver]);

    useEffect(() => {
        const handleUnload = () => {
            emitLeave();
        };

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            emitLeave();
        };
    }, []);

    useEffect(() => {
        const handleServerDeleted = (payload) => {
            const code = payload?.serverCode ?? payload?.code;
            if (code && code !== serverCode) {
                return;
            }
            setError('room.deleted');
        };

        socket.on('serverDeleted', handleServerDeleted);
        return () => {
            socket.off('serverDeleted', handleServerDeleted);
        };
    }, [socket, serverCode]);

    const handleBackClick = () => {
        emitLeave();
    };

    const handleOpenModal = (tab) => {
        setActiveTab(tab);
        setIsModalOpen(true);
    };

    if (error) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <nav className={'modal_bg'}>
                    <div className={'modal'}>
                        <div className={'modal_content_title'}>
                            <h2>{t('common.error')}</h2>
                        </div>
                        <form className={'modal_content'}>
                            <label style={{ width: '100%', textAlign: 'left' }}> {t(error)} </label>
                            <Link to="/app" className={'btn-push'} style={{ width: '100%', textAlign: 'center', padding: '1rem 0' }}>{t('common.home')}</Link>
                        </form>
                    </div>
                </nav>
            </div>
        );
    }

    if (!serverInfo) {
        return (
            <GameWaitMessage
                fullScreen
                title={t('room.connectingTitle')}
                subtitle={t('room.connectingSubtitle')}
            />
        );
    }

    if (role !== 'host' && role !== 'participant' && role !== 'observer') {
        return (
            <GameWaitMessage
                fullScreen
                title={t('room.accessDeniedTitle')}
                subtitle={t('room.accessDeniedSubtitle')}
            />
        );
    }

    return (
        <GameProvider
            serverCode={serverCode}
            initialGameState={serverInfo.gameStatus}
            initialGameOptions={serverInfo.options}
            initialBuzzOrder={serverInfo.buzzOrder}
            initialPlayers={serverInfo.players}
        >
            <GameFeedbackCard />
            {config.sendPings === 'true' && <PingViewer ping={currentPing} />}
            <div style={{ display: 'flex', padding: '2rem', flexDirection: 'row', justifyContent: 'space-between', gap: '2rem', alignItems: 'center', zIndex: '1', position: 'relative' }}>
                <button onClick={() => handleOpenModal('details')} className={'btn-push btn-push-gray'} style={{ padding: '0.5rem 1rem', gap: '1rem', width: '100%', display: 'flex', alignItems: 'center' }}>
                    <BlasonServerViewer imageIndex={serverInfo.blason.blason} />
                    <div>
                        <h6 style={{ textAlign: 'left' }}>{serverInfo.name}</h6>
                        <span onClick={() => handleOpenModal('players')} style={{ display: 'flex', gap: '5px' }}>
                            <FaUser /> <PlayerCount />
                            {role === 'observer' && <span style={{ marginLeft: '0.35rem' }}>{t('game.observerShort')}</span>}
                        </span>
                    </div>
                </button>
                <Link to="/app" onClick={handleBackClick} className={'btn-push'} style={{ padding: '0.1rem 0.7rem 0.3rem 0.75rem', height: 'fit-content' }}>{'x'}</Link>
            </div>
            {role === 'host' && <HostGameRoom serverInfo={serverInfo} />}
            {role === 'participant' && <PlayerGameRoom serverInfo={serverInfo} />}
            {role === 'observer' && <ObserverPanel />}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} style={{ maxWidth: 'none' }}>
                <div style={{ marginLeft: '15px', display: 'flex', gap: '10px' }}>
                    <button onClick={() => setActiveTab('details')} className={`modal-tab ${activeTab === 'details' ? 'active' : ''}`}>
                        {t('room.tabDetails')}
                    </button>
                    <button onClick={() => setActiveTab('players')} className={`modal-tab ${activeTab === 'players' ? 'active' : ''}`}>
                        {t('room.tabMembers')}
                    </button>
                    {role === 'host' && (
                        <button onClick={() => setActiveTab('settings')} className={`modal-tab ${activeTab === 'settings' ? 'active' : ''}`}>
                            {t('room.tabOptions')}
                        </button>
                    )}
                </div>
                {activeTab === 'details' ? (
                    <>
                        <RoomDetails serverInfo={serverInfo} />
                        <div style={{ margin: '0.5rem' }}></div>
                        <PlayerList serverInfo={serverInfo} />
                    </>
                ) : activeTab === 'players' ? (
                    <PlayerList serverInfo={serverInfo} />
                ) : (
                    <ServerSettings />
                )}
            </Modal>
        </GameProvider>
    );
}

export default GameRoom;

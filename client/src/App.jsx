//App.js
import { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import NotFound from './components/NotFound.jsx';
import GameRoom from './components/GameRoom/GameRoom.jsx';
import HomePage from './components/homePage/HomePage.jsx';
import LandingPage from './components/landing/LandingPage.jsx';
import UserNameInput from './components/UserNameInput/UserNameInput.jsx';
import AppBootScreen from './components/AppBootScreen.jsx';
import { SocketProvider } from './SocketContext.jsx';
import { TokenProvider } from './TokenContext.jsx';
import { UserProvider } from './UserContext.jsx';
import { ThemeProvider } from './ThemeContext.jsx';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext.jsx';
import config from './config.js';
import { normalizeProfileColor, normalizeProfileImageIndex } from './utils/profilePicture.js';
import { STORAGE_KEYS, clearAuthStorage, getStorageItem } from './utils/storage.js';
import { authenticateWithStoredToken } from './utils/auth.js';

function getInitialStatus() {
    return getStorageItem(STORAGE_KEYS.token) ? 'initial' : 'noToken';
}

function AuthenticatedShell({
    userId,
    userRole,
    userName,
    userPictureSmiley,
    userPictureColor,
    userBackground,
    setUserBackground,
    socketRef,
    token,
}) {
    return (
        <UserProvider
            userId={userId}
            userRole={userRole}
            userName={userName}
            userPictureSmiley={userPictureSmiley}
            userPictureColor={userPictureColor}
        >
            <TokenProvider token={token}>
                <SocketProvider socket={socketRef}>
                    <ThemeProvider userBackground={userBackground} setUserBackground={setUserBackground}>
                        <Outlet />
                    </ThemeProvider>
                </SocketProvider>
            </TokenProvider>
        </UserProvider>
    );
}

function AppContent() {
    const { t, language, setLanguage } = useLanguage();
    const [status, setStatus] = useState(getInitialStatus);
    const [statusMsg, setStatusMsg] = useState('');
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState('user');
    const [userName, setUserName] = useState('Inconnu');
    const [userPictureSmiley, setUserPictureSmiley] = useState(1);
    const [userPictureColor, setUserPictureColor] = useState('#999');
    const [userBackground, setUserBackground] = useState('default');
    const [isWaitingForPong, setIsWaitingForPong] = useState(false);
    const [currentPing, setCurrentPing] = useState(0);

    const socketRef = useRef();
    const skipLanguagePersistRef = useRef(false);
    const isReady = status === 'socketReady';
    const isGuest = status === 'noToken';
    const isBooting = status === 'initial' || status === 'authenticated';

    const setupSocket = useCallback(() => {
        console.log('setup');
        console.log(config.serverSocketUrl);
        if (socketRef.current) {
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        socketRef.current = io(config.serverSocketUrl, {
            transports: ['websocket', 'polling'],
            query: { token: getStorageItem(STORAGE_KEYS.token) },
        });

        socketRef.current.on('socketIdUpdated', () => {
            console.log('socketIdUpdated');
            setStatus('socketReady');
            setIsWaitingForPong(false);
        });

        socketRef.current.on('connect', () => {
            socketRef.current.emit('updateSocketId');
        });

        socketRef.current.on('disconnect', () => {
            setIsWaitingForPong(false);
        });

        socketRef.current.on('pong-server', ({ startTime }) => {
            const latency = Date.now() - startTime;
            setCurrentPing(latency);
            setIsWaitingForPong(false);
        });

        socketRef.current.on('forceDisconnect', () => {
            socketRef.current.disconnect();
            setStatus('forceDisconnect');
        });
        socketRef.current.on('adminForceDisconnect', () => {
            socketRef.current.disconnect();
            setStatus('adminForceDisconnect');
        });
        socketRef.current.on('kickServer', () => {
            socketRef.current.disconnect();
            setStatus('kickServer');
        });

        socketRef.current.on('updateProfile', ({
            newUserRole,
            newUserName,
            newUserPicture,
            newUserTheme,
            newUserLanguage,
        }) => {
            setUserRole(newUserRole);
            setUserName(newUserName);
            setUserPictureSmiley(normalizeProfileImageIndex(newUserPicture.smiley, false));
            setUserPictureColor(normalizeProfileColor(newUserPicture.color));
            setUserBackground(newUserTheme.background);
            if (newUserLanguage) {
                skipLanguagePersistRef.current = true;
                setLanguage(newUserLanguage);
            }
        });
    }, [setLanguage]);

    const authenticateUser = useCallback(async () => {
        console.log('Authenticating user...');
        try {
            const result = await authenticateWithStoredToken();
            if (result.reason === 'noToken') {
                setStatus('noToken');
                return;
            }
            if (!result.ok) {
                setStatusMsg(result.message || 'Token invalide.');
                setStatus('authError');
                return;
            }

            setUserId(result.user.userId);
            setUserRole(result.user.userRole);
            setUserName(result.user.userName);
            setUserPictureSmiley(normalizeProfileImageIndex(result.user.userPicture.smiley, false));
            setUserPictureColor(normalizeProfileColor(result.user.userPicture.color));
            setUserBackground(result.user.userTheme.background);
            if (result.user.userLanguage) {
                skipLanguagePersistRef.current = true;
                setLanguage(result.user.userLanguage);
            }
            setStatus('authenticated');
            setupSocket();
        } catch {
            setStatus('connectError');
        }
    }, [setupSocket, setLanguage]);

    useEffect(() => {
        authenticateUser();
    }, [authenticateUser]);

    useEffect(() => {
        if (!isReady || !socketRef.current) {
            return;
        }
        if (skipLanguagePersistRef.current) {
            skipLanguagePersistRef.current = false;
            return;
        }
        socketRef.current.emit('updateUserLanguage', { userLanguage: language });
    }, [language, isReady]);

    const ping = useCallback(() => {
        if (!isWaitingForPong && socketRef.current) {
            const startTime = Date.now();
            socketRef.current.emit('ping-server', startTime);
            setIsWaitingForPong(true);
        }
    }, [isWaitingForPong]);

    useEffect(() => {
        const interval = setInterval(ping, 5000);
        return () => clearInterval(interval);
    }, [ping]);

    const onRegisterSuccess = () => {
        console.log('Register success...');
        authenticateUser();
    };

    const onLogout = () => {
        console.log('logout...');
        clearAuthStorage();
        window.location.reload();
    };

    if (status === 'connectError') {
        return (
            <div className="modal_bg">
                <div className="modal">
                    <div className="modal_content_title">
                        <h2>{t('common.error')}</h2>
                    </div>
                    <div className="modal_content">
                        <label style={{ width: '100%', textAlign: 'center' }}>
                            {t('app.connectError')}
                        </label>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-push btn-push-green"
                            style={{ padding: '1rem 1.5rem' }}
                        >
                            {t('common.retry')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'authError') {
        return (
            <div className="modal_bg">
                <div className="modal">
                    <div className="modal_content_title">
                        <h2>{t('common.error')}</h2>
                    </div>
                    <div className="modal_content">
                        <label style={{ width: '100%', textAlign: 'center' }}>
                            {t('app.authError', { message: statusMsg })}
                        </label>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-push btn-push-green"
                            style={{ padding: '1rem 1.5rem' }}
                        >
                            {t('common.retry')}
                        </button>
                        <button onClick={onLogout} className="btn-push" style={{ padding: '1rem 1.5rem' }}>
                            {t('common.logout')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'forceDisconnect') {
        return (
            <div className="modal_bg">
                <div className="modal">
                    <div className="modal_content_title">
                        <h2>{t('common.error')}</h2>
                    </div>
                    <div className="modal_content">
                        <label style={{ width: '100%', textAlign: 'center' }}>
                            {t('app.forceDisconnect')}
                        </label>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-push btn-push-green"
                            style={{ padding: '1rem 1.5rem' }}
                        >
                            {t('common.reconnect')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'adminForceDisconnect') {
        return (
            <div className="modal_bg">
                <div className="modal">
                    <div className="modal_content_title">
                        <h2>{t('common.error')}</h2>
                    </div>
                    <div className="modal_content">
                        <label style={{ width: '100%', textAlign: 'center' }}>
                            {t('app.adminDisconnect')}
                        </label>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-push btn-push-green"
                            style={{ padding: '1rem 1.5rem' }}
                        >
                            {t('common.reconnect')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'kickServer') {
        return (
            <div className="modal_bg">
                <div className="modal">
                    <div className="modal_content_title">
                        <h2>{t('common.error')}</h2>
                    </div>
                    <div className="modal_content">
                        <label style={{ width: '100%', textAlign: 'center' }}>
                            {t('app.kick')}
                        </label>
                        <button
                            onClick={() => {
                                window.location.href = `${config.instanceUrl}/app`;
                            }}
                            className="btn-push"
                            style={{ padding: '1rem 1.5rem' }}
                        >
                            {t('common.home')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const token = getStorageItem(STORAGE_KEYS.token);

    const authLayout = (
        <AuthenticatedShell
            userId={userId}
            userRole={userRole}
            userName={userName}
            userPictureSmiley={userPictureSmiley}
            userPictureColor={userPictureColor}
            userBackground={userBackground}
            setUserBackground={setUserBackground}
            socketRef={socketRef}
            token={token}
        />
    );

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage authenticated={isReady} />} />
                <Route
                    path="/jouer"
                    element={
                        isReady
                            ? <Navigate to="/app" replace />
                            : isGuest
                                ? <UserNameInput onSuccess={onRegisterSuccess} />
                                : <AppBootScreen />
                    }
                />

                {isReady ? (
                    <Route element={authLayout}>
                        <Route path="/app" element={<HomePage />} />
                        <Route path="/server/:serverCode" element={<GameRoom currentPing={currentPing} />} />
                    </Route>
                ) : (
                    <>
                        <Route
                            path="/app"
                            element={isGuest ? <Navigate to="/jouer" replace /> : <AppBootScreen />}
                        />
                        <Route
                            path="/server/:serverCode"
                            element={
                                isGuest
                                    ? <UserNameInput onSuccess={onRegisterSuccess} />
                                    : <AppBootScreen />
                            }
                        />
                    </>
                )}

                <Route
                    path="*"
                    element={isReady ? <NotFound /> : isBooting ? <AppBootScreen /> : <Navigate to="/" replace />}
                />
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    );
}

export default App;

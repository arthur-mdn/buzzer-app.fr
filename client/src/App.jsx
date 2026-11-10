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

function App() {
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

        socketRef.current.on('updateProfile', ({ newUserRole, newUserName, newUserPicture, newUserTheme }) => {
            setUserRole(newUserRole);
            setUserName(newUserName);
            setUserPictureSmiley(normalizeProfileImageIndex(newUserPicture.smiley, false));
            setUserPictureColor(normalizeProfileColor(newUserPicture.color));
            setUserBackground(newUserTheme.background);
        });
    }, []);

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
            setStatus('authenticated');
            setupSocket();
        } catch {
            setStatus('connectError');
        }
    }, [setupSocket]);

    useEffect(() => {
        authenticateUser();
    }, [authenticateUser]);

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
                        <h2>Erreur !</h2>
                    </div>
                    <div className="modal_content">
                        <label htmlFor="name" style={{ width: '100%', textAlign: 'center' }}>
                            Erreur de connexion au serveur
                        </label>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-push btn-push-green"
                            style={{ padding: '1rem 1.5rem' }}
                        >
                            Réessayer
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
                        <h2>Erreur !</h2>
                    </div>
                    <div className="modal_content">
                        <label htmlFor="name" style={{ width: '100%', textAlign: 'center' }}>
                            Erreur de connexion : {statusMsg}
                        </label>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-push btn-push-green"
                            style={{ padding: '1rem 1.5rem' }}
                        >
                            Réessayer
                        </button>
                        <button onClick={onLogout} className="btn-push" style={{ padding: '1rem 1.5rem' }}>
                            Déconnexion
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
                        <h2>Erreur !</h2>
                    </div>
                    <div className="modal_content">
                        <label htmlFor="name" style={{ width: '100%', textAlign: 'center' }}>
                            Oops... Vous semblez vous être connecté sur un autre appareil.
                        </label>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-push btn-push-green"
                            style={{ padding: '1rem 1.5rem' }}
                        >
                            Reconnexion
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
                        <h2>Erreur !</h2>
                    </div>
                    <div className="modal_content">
                        <label htmlFor="name" style={{ width: '100%', textAlign: 'center' }}>
                            Vous avez été déconnecté par un administrateur.
                        </label>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-push btn-push-green"
                            style={{ padding: '1rem 1.5rem' }}
                        >
                            Reconnexion
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
                        <h2>Erreur !</h2>
                    </div>
                    <div className="modal_content">
                        <label htmlFor="name" style={{ width: '100%', textAlign: 'center' }}>
                            Vous avez été exclu du serveur.
                        </label>
                        <button
                            onClick={() => {
                                window.location.href = `${config.instanceUrl}/app`;
                            }}
                            className="btn-push"
                            style={{ padding: '1rem 1.5rem' }}
                        >
                            Accueil
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

export default App;

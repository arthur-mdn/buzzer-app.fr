//App.js
import  {useEffect, useState, useRef, useCallback} from 'react';
import io from 'socket.io-client';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFound from "./components/NotFound.jsx";
import GameRoom from './components/GameRoom/GameRoom.jsx';
import HomePage from './components/homePage/HomePage.jsx';
import UserNameInput from './components/UserNameInput/UserNameInput.jsx';
import { SocketProvider } from './SocketContext.jsx';
import { TokenProvider } from './TokenContext.jsx';
import { UserProvider } from './UserContext.jsx';
import { ThemeProvider } from './ThemeContext.jsx';
import config from './config.js';
import { normalizeProfileColor, normalizeProfileImageIndex } from './utils/profilePicture.js';
import { STORAGE_KEYS, clearAuthStorage, getStorageItem } from './utils/storage.js';


function App() {
    const [status, setStatus] = useState('initial');
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

    const setupSocket = useCallback(() => {
        console.log('setup')
        console.log(config.serverSocketUrl)
        if (socketRef.current) {
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        socketRef.current = io(config.serverSocketUrl, {
            transports: ['websocket', 'polling'],
            query: { token: getStorageItem(STORAGE_KEYS.token) }
        });

        socketRef.current.on('socketIdUpdated', () => {
            console.log("socketIdUpdated")
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

        socketRef.current.on('updateProfile', ({newUserRole, newUserName, newUserPicture, newUserTheme}) => {
            setUserRole(newUserRole);
            setUserName(newUserName);
            setUserPictureSmiley(normalizeProfileImageIndex(newUserPicture.smiley, false));
            setUserPictureColor(normalizeProfileColor(newUserPicture.color));
            setUserBackground(newUserTheme.background);
        });
    }, []);

    const authenticateUser = useCallback(async (token) => {
        console.log("Authenticating user...");
        try {
            const response = await fetch(config.serverUrl+'/authenticate', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setStatus('authenticated');
                setupSocket();
                setUserId(data.userId);
                setUserRole(data.userRole);
                setUserName(data.userName);
                setUserPictureSmiley(normalizeProfileImageIndex(data.userPicture.smiley, false));
                setUserPictureColor(normalizeProfileColor(data.userPicture.color));
                setUserBackground(data.userTheme.background);
            } else {
                setStatusMsg(data.message);
                setStatus('authError');
            }
        } catch {
            setStatus('connectError');
        }
    }, [setupSocket]);

    useEffect(() => {
        const token = getStorageItem(STORAGE_KEYS.token);

        if (token) {
            authenticateUser(token);
        } else {
            setStatus('noToken');
        }
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
        console.log("Register success...");
        const token = getStorageItem(STORAGE_KEYS.token);
        if (token) {
            authenticateUser(token);
        }
    };
    const onLogout = () => {
        console.log("logout...");
        clearAuthStorage();
        window.location.reload()
    };
    switch (status) {
        case 'noToken':
            return <UserNameInput onSuccess={onRegisterSuccess} />;
        case 'connectError':
            return <div className={'modal_bg'}>
                <div className={'modal'}>
                    <div className={'modal_content_title'}>
                        <h2>Erreur !</h2>
                    </div>
                    <div className={'modal_content'}>
                        <label htmlFor={'name'} style={{width:'100%',textAlign:'center'}}>Erreur de connexion au serveur</label>
                        <button onClick={() => window.location.reload()}  className={'btn-push btn-push-green'} style={{padding: '1rem 1.5rem'}}>Réessayer</button>
                    </div>
                </div>
            </div>
                ;

        case 'authError':
            return <div className={'modal_bg'}>
                <div className={'modal'}>
                    <div className={'modal_content_title'}>
                        <h2>Erreur !</h2>
                    </div>
                    <div className={'modal_content'}>
                        <label htmlFor={'name'} style={{width:'100%',textAlign:'center'}}>Erreur de connexion : {statusMsg}</label>
                        <button onClick={() => window.location.reload()} className={'btn-push btn-push-green'}  style={{padding: '1rem 1.5rem'}}>Réessayer</button>
                        <button onClick={onLogout} className={'btn-push'} style={{padding: '1rem 1.5rem'}}>Déconnexion</button>
                    </div>
                </div>
            </div>;
        case 'forceDisconnect':
            return (
                <div className={'modal_bg'}>
                    <div className={'modal'}>
                        <div className={'modal_content_title'}>
                            <h2>Erreur !</h2>
                        </div>
                        <div className={'modal_content'}>
                            <label htmlFor={'name'} style={{width:'100%',textAlign:'center'}}> Oops... Vous semblez vous être connecté sur un autre appareil.</label>
                            <button onClick={() => window.location.reload()}  className={'btn-push btn-push-green'} style={{padding: '1rem 1.5rem'}}>Reconnexion</button>
                        </div>
                    </div>
                </div>
            );
        case 'adminForceDisconnect':
            return (
                <div className={'modal_bg'}>
                    <div className={'modal'}>
                        <div className={'modal_content_title'}>
                            <h2>Erreur !</h2>
                        </div>
                        <div className={'modal_content'}>
                            <label htmlFor={'name'} style={{width:'100%',textAlign:'center'}}> Vous avez été déconnecté par un administrateur.</label>
                            <button onClick={() => window.location.reload()}  className={'btn-push btn-push-green'} style={{padding: '1rem 1.5rem'}}>Reconnexion</button>
                        </div>
                    </div>
                </div>
            );
        case 'kickServer':
            return (
                <div className={'modal_bg'}>
                    <div className={'modal'}>
                        <div className={'modal_content_title'}>
                            <h2>Erreur !</h2>
                        </div>
                        <div className={'modal_content'}>
                            <label htmlFor={'name'} style={{width:'100%',textAlign:'center'}}> Vous avez été exclu du serveur.</label>
                            <button onClick={() => window.location.href = config.instanceUrl+"/"}  className={'btn-push'} style={{padding: '1rem 1.5rem'}}>Accueil</button>
                        </div>
                    </div>
                </div>
            );
        case 'socketReady': {
            const token = getStorageItem(STORAGE_KEYS.token);
            return (
                <UserProvider userId={userId} userRole={userRole} userName={userName} userPictureSmiley={userPictureSmiley} userPictureColor={userPictureColor}>
                    <TokenProvider token={token}>
                        <SocketProvider socket={socketRef}>
                            <ThemeProvider userBackground={userBackground} setUserBackground={setUserBackground}>
                                <Router>
                                    <Routes>
                                        <Route path="/" element={ <HomePage />} />
                                        <Route path="/server/:serverCode" element={<GameRoom currentPing={currentPing}/>} />
                                        <Route path="*" element={<NotFound />} />
                                    </Routes>
                                </Router>
                            </ThemeProvider>
                        </SocketProvider>
                    </TokenProvider>
                </UserProvider>
            );
        }
        default:
            return <div className={'modal_bg'}>
                <div className={'modal'}>
                    <div className={'modal_content_title'}>
                        <h2>Chargement</h2>
                    </div>
                    <div className={'modal_content'}>
                        <label htmlFor={'name'} style={{width:'100%',textAlign:'center'}}>Chargement... Veuillez patienter</label>
                    </div>
                </div>
            </div>;
    }
}

export default App;

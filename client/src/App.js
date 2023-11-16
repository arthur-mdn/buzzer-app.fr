import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Host from './components/host/Host';
import Join from './components/player/Join';
import GameRoom from './components/GameRoom/GameRoom';
import HomePage from './components/homePage/HomePage';
import UserNameInput from './components/UserNameInput/UserNameInput';
import { SocketProvider } from './SocketContext';
import { TokenProvider } from './TokenContext';
import { UserProvider } from './UserContext';
const config = require('./config');


function App() {
  const [status, setStatus] = useState('initial');
  const [statusMsg, setStatusMsg] = useState('');
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState('user');

  const socketRef = useRef();
  console.log("App rendered");
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      authenticateUser(token);
    } else {
      setStatus('noToken');
    }
  }, []);

  const authenticateUser = async (token) => {
    console.log("Authenticating user...");
    try {
      const response = await fetch(config.serverUrl+'/authenticate', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStatus('authenticated');
        setupSocket(data.userId);
        setUserId(data.userId);
        setUserRole(data.userRole);
      } else {
        setStatusMsg(data.message);
        setStatus('authError');
      }
    } catch (error) {
      setStatus('connectError');
    }
  };

  const setupSocket = (userId) => {
    console.log('setup')

    socketRef.current = io(config.serverSocketUrl, {
      transports: ['websocket', 'polling'],
      query: { token: localStorage.getItem('token') }
    });
    
    socketRef.current.on('socketIdUpdated', () => {
      console.log("socketIdUpdated")
      setStatus('socketReady');
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('updateSocketId', { userId });
    });

    socketRef.current.on('forceDisconnect', () => {
      // alert("Vous avez ouvert une nouvelle session dans un autre onglet. Cette session sera déconnectée.");
      socketRef.current.disconnect(); // Fermer la connexion socket
      setStatus('forceDisconnect');

      // Vous pouvez également rediriger l'utilisateur vers une autre page ou rafraîchir la page actuelle
    });
  };

  const onRegisterSuccess = () => {
    console.log("Register success...");
    const token = localStorage.getItem('token');
    if (token) {
      authenticateUser(token);
    }
  };
  const onLogout = () => {
    console.log("logout...");
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
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
    case 'socketReady':
      const token = localStorage.getItem('token'); // Récupérez le token
      return (
          <UserProvider userId={userId} userRole={userRole}>
            <TokenProvider token={token}>
              <SocketProvider socket={socketRef}>
                <Router>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/host" element={<Host />} />
                    <Route path="/join" element={<Join />} />
                    <Route path="/server/:serverCode" element={<GameRoom />} />
                  </Routes>
                </Router>
              </SocketProvider>
            </TokenProvider>
          </UserProvider>
      );
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

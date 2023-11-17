// HomePage.js
import React, { useState} from 'react';
import { Link } from "react-router-dom";
import { useSocket } from '../../SocketContext';
import { useUser } from '../../UserContext';
import UserHistory from "../GameRoom/UserHistory";
const config = require('../../config');

function HomePage() {
    const { userRole } = useUser();
    const socket = useSocket();
    const [serverActiveTab, setServerActiveTab] = useState('history'); // 'history' ou 'public'

    const handleDisconnectAll = () => {
        socket.emit('adminForceDisconnect');
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <img src={config.instanceUrl + '/logo.png'} alt="Logo" style={{width: '100%', maxWidth: '300px', marginTop:'3rem', aspectRatio: '1/1'}}/>
            <nav>
                <ul style={{listStyle: 'none', padding: '0'}}>
                    <li className={'btn-push btn-push-green'}>
                        <Link to="/host">Créer</Link>
                    </li>
                    <br/>
                    <li className={'btn-push btn-push-green'}>
                        <Link to="/join">Rejoindre</Link>
                    </li>
                </ul>
            </nav>

            <div className={'modal'}>
                <div className={'modal_content_title'}>
                    <h2>Liens rapides</h2>
                </div>
                <div style={{marginLeft: '15px', display: 'flex', gap: '10px'}}>
                    <button onClick={() => setServerActiveTab('history')}
                            className={`modal-tab ${serverActiveTab === 'history' ? 'active' : ''}`}>
                        Historique
                    </button>
                    <button onClick={() => setServerActiveTab('public')}
                            className={`modal-tab ${serverActiveTab === 'public' ? 'active' : ''}`}>
                        Public
                    </button>
                </div>
                {serverActiveTab === 'history' ? <UserHistory/> : <></>}
            </div>


            {userRole === "admin" &&
                <div>
                    <h3>YoADMIN</h3>
                    <button onClick={handleDisconnectAll} className={'btn-push btn-push-red'}>
                        Déconnecter tous les utilisateurs
                    </button>
                </div>
            }


        </div>
    );
}

export default HomePage;

//GameRoom.js
import React, {useEffect, useRef, useState} from 'react';
import HostGameRoom from './HostGameRoom';
import PlayerGameRoom from './PlayerGameRoom';
import {Link, useParams} from "react-router-dom";
import PlayerList from "./PlayerList";
import {useSocket} from "../../SocketContext";
import { useUser } from '../../UserContext';
import {useToken} from "../../TokenContext";
import { GameProvider } from '../../GameContext';
import {FaUser} from "react-icons/fa";
import RoomDetails from "./RoomDetails";
const config = require('../../config');


function GameRoom() {
    const socket = useSocket();
    const userId = useUser();
    const token = useToken();
    const { serverCode } = useParams();
    const [role, setRole] = useState(null); // 'host' ou 'participant'
    const [serverInfo, setServerInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServerDetails = async () => {
            try {

                // Récupérer l'userId du localStorage
                const response = await fetch(config.serverUrl + `/server/${serverCode}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();

                if(data.success){
                    setServerInfo(data.server);
                    // console.log(data.server)
                    setRole(data.role);
                    socket.emit('joinServer', { serverCode: serverCode });
                }else{
                    setError('Serveur introuvable.');
                }
                console.log(data)

            } catch (error) {
                console.error('There was an error fetching the server details:', error);
                setError('Erreur lors de la récupération des détails du serveur. Veuillez réessayer.');
            }
        };
        fetchServerDetails();
    }, [serverCode, socket, token]);

    useEffect(() => {
        const handleUnload = () => {
            socket.emit('userLeaving', { userId: userId });
        };

        window.addEventListener("beforeunload", handleUnload);

        return () => {
            window.removeEventListener("beforeunload", handleUnload);
        };
    }, [socket, userId]);

    const handleBackClick = () => {
        socket.emit('userLeaving', { userId: userId });
    };



    // console.log(serverInfo)
    if (error) {
        return (

            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <nav className={'modal_bg'}>
                    <div className={'modal'}>
                        <div className={'modal_content_title'}>
                            <h2>Erreur !</h2>
                        </div>
                        <form className={'modal_content'}>
                            <label style={{width:'100%',textAlign:'left'}}> {error} </label>
                            <Link to="/" className={'btn-push'} style={{width: '100%', textAlign:'center',padding: '1rem 0'}} >Accueil</Link>
                        </form>
                    </div>
                </nav>
            </div>


        );
    }

    // console.log(serverInfo)
    if (!serverInfo) {
        return <div>Récupération des informations du serveur...</div>; // Ou tout autre composant de chargement
    }

    if (role === 'host') {
        return <GameProvider initialGameState={serverInfo.gameStatus} initialBuzzOrder={serverInfo.buzzOrder} >
            <div style={{display:'flex', padding:'2rem', flexDirection:'row', justifyContent:'space-between'}}>
                <Link to="/" onClick={handleBackClick} className={'btn-push'} style={{padding: '1rem 1.5rem',  zIndex: '2'}} >{'<'}</Link>
                <RoomDetails serverInfo={serverInfo} />
                <PlayerList serverInfo={serverInfo}/>
            </div>
            <HostGameRoom serverInfo={serverInfo}/>
        </GameProvider>;
    } else if (role === 'participant') {
        return <GameProvider initialGameState={serverInfo.gameStatus} initialBuzzOrder={serverInfo.buzzOrder}>
            <div style={{display:'flex', padding:'2rem', flexDirection:'row', justifyContent:'space-between'}}>
                <Link to="/" onClick={handleBackClick} className={'btn-push'} style={{padding: '1rem 1.5rem',  zIndex: '2'}} >{'<'}</Link>
                <RoomDetails serverInfo={serverInfo} />
                <PlayerList serverInfo={serverInfo}/>
            </div>
            <PlayerGameRoom serverInfo={serverInfo}  />
        </GameProvider>;
    } else {
        // Vous pouvez afficher un spinner ou un autre indicateur de chargement ici pendant que le rôle est déterminé
        return <div>Rôle en cours de chargement...</div>;
    }
}

export default GameRoom;

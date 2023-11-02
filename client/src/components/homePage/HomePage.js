// HomePage.js
import React, {useEffect, useState} from 'react';
import { Link } from "react-router-dom";
import { FaUser, FaCircle } from 'react-icons/fa';
import homePageStyle from "../../homePage.css";
import {FaUserGroup} from "react-icons/fa6";
import { useSocket } from '../../SocketContext';
const config = require('../../config');

function HomePage({ userId }) {
    const socket = useSocket();
    const [userServers, setUserServers] = useState([]);

    useEffect(() => {
        // Abonnement à l'événement 'playersUpdate'
        socket.on('playersUpdate', (updatedServer) => {
            setUserServers(prevServers => {
                // Mettez à jour la liste des serveurs avec les serveurs mis à jour
                return prevServers.map(server => {
                    if (server._id === updatedServer._id) {
                        return updatedServer;  // Remplacez le serveur par la version mise à jour
                    }
                    return server;  // Retournez le serveur inchangé
                });
            });
        });

        // Pas besoin d'une fonction de nettoyage ici car le socket est géré dans App.js
    }, [setUserServers, socket]);


    useEffect(() => {
        const fetchUserServers = async () => {
            try {
                const response = await fetch(config.serverUrl + '/user-servers', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const servers = await response.json();
                setUserServers(servers);

                // Faites rejoindre chaque salle de serveur
                servers.forEach(server => {
                    socket.emit('joinRoom', server.code);
                });

            } catch (error) {
                console.error('Error fetching user servers:', error);
            }
        };

        fetchUserServers();
    }, [userId]); // N'oubliez pas la dépendance userId dans la liste des dépendances de useEffect

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <img src={process.env.PUBLIC_URL + '/logo.png'} alt="Logo" style={{width: '100%', maxWidth: '300px', marginTop:'3rem', aspectRatio: '1/1'}}/>
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
            {userServers.length > 0 && (
                <div>
                    <h3>Vos serveurs précédents:</h3>
                    <ul  style={{listStyle: 'none', padding: '0'}}>
                        {userServers.map(server => {
                            const onlinePlayersCount = server.players.filter(player => player.state === "online").length;
                            return (
                                <li key={server._id} className={'server_button'}>
                                    <Link to={`/server/${server.code}`}>
                                        <span>{server.name}</span>
                                        <span className={'online'}>{onlinePlayersCount} <FaUserGroup /></span>
                                    </Link>
                                </li>
                            );
                        })}

                    </ul>
                </div>
            )}


        </div>
    );
}

export default HomePage;

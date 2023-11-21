// UserHistory.js
import React, {useEffect, useState} from 'react';
import {useUser} from "../../UserContext";
import {useSocket} from "../../SocketContext";
import config from "../../config";
import {Link} from "react-router-dom";
import {FaUserGroup} from "react-icons/fa6";
import {useToken} from "../../TokenContext";
import BlasonServerViewer from "../host/BlasonServerViewer";

function UserHistory() {
    const token = useToken();
    const socket = useSocket();
    const { userId } = useUser();
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
                    headers: { 'Authorization': `Bearer ${token}` }
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
    }, [socket, token, userId]);


    return (
        <div>
            {userServers.length <= 0 && (
                <div className={"modal_content"}>
                    Vous n'avez rejoins aucun serveur pour le moment.
                </div>
            )}
            {userServers.length > 0 && (
                <ul  style={{listStyle: 'none', padding: '1rem 0.5rem', margin:'0',maxHeight:'60vh', overflowY:"scroll", height:'100%'}} className={"modal_content"}>
                    {userServers.map(server => {
                        const onlinePlayersCount = server.players.filter(player => player.state === "online").length;
                        return (
                            <li key={server._id} className={'btn-push btn-push-green'}>
                                <Link to={`/server/${server.code}`} style={{display:"flex",padding:'0',margin:'0.5rem 1rem', gap:'0.5rem'}}>
                                    <BlasonServerViewer imageIndex={server.blason.blason}/>
                                    <div>
                                        <h6 style={{margin:'0', fontSize:'1rem'}}>{server.name}</h6>
                                        <span style={{fontSize:'1.2rem'}}>{onlinePlayersCount} <FaUserGroup /></span>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}


export default UserHistory;

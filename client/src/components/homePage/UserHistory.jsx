import { useEffect, useState } from 'react';
import { useUser } from '../../UserContext.jsx';
import { useSocket } from '../../SocketContext.jsx';
import config from '../../config';
import { useToken } from '../../TokenContext.jsx';
import ServerList from './ServerList.jsx';

function UserHistory() {
    const token = useToken();
    const socket = useSocket();
    const { userId } = useUser();
    const [userServers, setUserServers] = useState([]);

    useEffect(() => {
        const onPlayersUpdate = (updatedServer) => {
            setUserServers((prevServers) =>
                prevServers.map((server) =>
                    server._id === updatedServer._id ? updatedServer : server
                )
            );
        };

        socket.on('playersUpdate', onPlayersUpdate);
        return () => socket.off('playersUpdate', onPlayersUpdate);
    }, [socket]);

    useEffect(() => {
        const fetchUserServers = async () => {
            try {
                const response = await fetch(config.serverUrl + '/user-servers', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const servers = await response.json();
                setUserServers(servers);
                servers.forEach((server) => socket.emit('joinRoom', server.code));
            } catch (error) {
                console.error('Error fetching user servers:', error);
            }
        };

        fetchUserServers();
    }, [socket, token, userId]);

    return (
        <ServerList
            servers={userServers}
            emptyMessage="Tu n'as rejoint aucun salon pour le moment."
        />
    );
}

export default UserHistory;

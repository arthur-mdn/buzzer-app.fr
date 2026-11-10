import { useEffect, useState } from 'react';
import { useUser } from '../../UserContext.jsx';
import { useSocket } from '../../SocketContext.jsx';
import config from '../../config';
import { useToken } from '../../TokenContext.jsx';
import ServerList from './ServerList.jsx';
import { useWatchedServers } from '../../hooks/useWatchedServers.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

function AdminServerList() {
    const token = useToken();
    const { t } = useLanguage();
    const socket = useSocket();
    const { userId } = useUser();
    const [userServers, setUserServers] = useState([]);

    useWatchedServers(socket, userServers);

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
        const fetchAdminServers = async () => {
            try {
                const response = await fetch(config.serverUrl + '/admin-servers', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const servers = await response.json();
                setUserServers(Array.isArray(servers) ? servers : []);
            } catch (error) {
                console.error('Error fetching admin servers:', error);
            }
        };

        fetchAdminServers();
    }, [socket, token, userId]);

    return (
        <ServerList
            servers={userServers}
            emptyMessage={t('admin.noServer')}
        />
    );
}

export default AdminServerList;

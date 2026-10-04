import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FaChevronDown, FaChevronRight, FaEye, FaPlug, FaShieldHalved, FaUser, FaUserGroup } from 'react-icons/fa6';
import { useSocket } from '../../SocketContext.jsx';
import { useToken } from '../../TokenContext.jsx';
import { useUser } from '../../UserContext.jsx';
import config from '../../config.js';
import Modal from '../modal/Modal.jsx';
import BlasonServerViewer from '../host/BlasonServerViewer.jsx';
import ProfilePictureViewer from '../UserNameInput/ProfilePictureViewer.jsx';
import { countOnlinePlayers, sortServersByRecency } from '../../utils/serverList.js';
import { useWatchedServers } from '../../hooks/useWatchedServers.js';

function formatConnectedSince(connectedAt) {
    if (!connectedAt) {
        return '-';
    }
    const seconds = Math.max(0, Math.floor((Date.now() - connectedAt) / 1000));
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    return `${hours} h ${minutes % 60} min`;
}

function hasPlayers(server) {
    return (server?.players?.length ?? 0) > 0;
}

function hasProfilePicture(picture) {
    return picture && (picture.smiley != null || picture.color);
}

function PlayerAvatar({ picture, size = '2.5rem' }) {
    if (!hasProfilePicture(picture)) {
        return (
            <span className="admin-avatar-placeholder" style={{ width: size, height: size }} aria-hidden="true">
                ?
            </span>
        );
    }
    return (
        <ProfilePictureViewer
            imageIndex={picture.smiley}
            imageColor={picture.color}
            size={size}
        />
    );
}

function AdminView() {
    const socket = useSocket();
    const token = useToken();
    const { userId } = useUser();
    const navigate = useNavigate();

    const [openPanel, setOpenPanel] = useState(null);
    const [sockets, setSockets] = useState([]);
    const [servers, setServers] = useState([]);
    const [selectedServer, setSelectedServer] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [showEmptyServers, setShowEmptyServers] = useState(false);
    const [profileDetails, setProfileDetails] = useState(null);

    const watchingServers = openPanel === 'servers' || Boolean(selectedServer);
    useWatchedServers(socket, watchingServers ? servers : []);

    const refreshSockets = useCallback(() => {
        socket.emit('adminGetSockets');
    }, [socket]);

    const fetchServers = useCallback(async () => {
        try {
            const response = await fetch(`${config.serverUrl}/admin-servers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setServers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching admin servers:', error);
        }
    }, [token]);

    const openServerDetail = useCallback(async (serverCode) => {
        try {
            const response = await fetch(`${config.serverUrl}/admin/server/${encodeURIComponent(serverCode)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const contentType = response.headers.get('content-type') || '';
            if (!response.ok || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Error fetching admin server detail:', response.status, text.slice(0, 200));
                return;
            }
            const data = await response.json();
            if (data.success) {
                setSelectedServer(data.server);
            }
        } catch (error) {
            console.error('Error fetching admin server detail:', error);
        }
    }, [token]);

    const backToServers = useCallback(() => {
        setSelectedServer(null);
        setOpenPanel('servers');
    }, []);

    const closeServersFlow = useCallback(() => {
        setSelectedServer(null);
        setOpenPanel(null);
    }, []);

    const openUserProfile = useCallback(async (targetUserId) => {
        if (!targetUserId) {
            return;
        }
        try {
            const response = await fetch(`${config.serverUrl}/user-profile/${encodeURIComponent(targetUserId)}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setProfileDetails(data.user);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    }, [token]);

    useEffect(() => {
        if (openPanel !== 'sockets') {
            return undefined;
        }

        const onSockets = (payload) => setSockets(Array.isArray(payload?.sockets) ? payload.sockets : []);
        socket.on('adminSockets', onSockets);
        refreshSockets();
        const interval = setInterval(refreshSockets, 3000);

        return () => {
            socket.off('adminSockets', onSockets);
            clearInterval(interval);
        };
    }, [socket, openPanel, refreshSockets]);

    useEffect(() => {
        if (openPanel !== 'servers' && !selectedServer) {
            return undefined;
        }

        const onPlayersUpdate = (updatedServer) => {
            setServers((prev) =>
                prev.map((server) => (server._id === updatedServer._id ? updatedServer : server))
            );
            if (selectedServer?.code === updatedServer.code) {
                openServerDetail(updatedServer.code);
            }
        };

        socket.on('playersUpdate', onPlayersUpdate);

        if (openPanel === 'servers' && !selectedServer) {
            fetchServers();
            const interval = setInterval(fetchServers, 5000);
            return () => {
                socket.off('playersUpdate', onPlayersUpdate);
                clearInterval(interval);
            };
        }

        return () => {
            socket.off('playersUpdate', onPlayersUpdate);
        };
    }, [socket, openPanel, selectedServer?.code, fetchServers, openServerDetail, selectedServer]);

    const runConfirmedAction = () => {
        if (!confirmAction) {
            return;
        }
        if (confirmAction.type === 'disconnectAll') {
            socket.emit('adminForceDisconnect');
        } else if (confirmAction.type === 'resetPictures') {
            socket.emit('adminForceResetProfilPictures');
        } else if (confirmAction.type === 'disconnectSocket' && confirmAction.socketId) {
            socket.emit('adminDisconnectSocket', { socketId: confirmAction.socketId });
            if (openPanel === 'sockets') {
                setTimeout(refreshSockets, 300);
            }
        } else if (confirmAction.type === 'kick' && selectedServer?.code && confirmAction.playerId) {
            socket.emit('kickPlayer', {
                serverCode: selectedServer.code,
                playerId: confirmAction.playerId,
            });
            setTimeout(() => openServerDetail(selectedServer.code), 300);
        } else if (confirmAction.type === 'join' && confirmAction.serverCode) {
            const code = confirmAction.serverCode;
            setConfirmAction(null);
            setSelectedServer(null);
            setOpenPanel(null);
            navigate(`/server/${code}`);
            return;
        }
        setConfirmAction(null);
    };

    const sortedServers = useMemo(() => sortServersByRecency(servers), [servers]);
    const occupiedServers = useMemo(
        () => sortedServers.filter((server) => hasPlayers(server)),
        [sortedServers]
    );
    const emptyServers = useMemo(
        () => sortedServers.filter((server) => !hasPlayers(server)),
        [sortedServers]
    );

    const confirmMessage = (() => {
        if (!confirmAction) {
            return '';
        }
        if (confirmAction.type === 'disconnectAll') {
            return 'Déconnecter tous les utilisateurs ?';
        }
        if (confirmAction.type === 'resetPictures') {
            return 'Réinitialiser toutes les photos de profil ?';
        }
        if (confirmAction.type === 'disconnectSocket') {
            if (confirmAction.isSelf) {
                return 'Tu vas te déconnecter toi-même. Continuer ?';
            }
            return `Déconnecter ${confirmAction.userName || 'cette socket'} ?`;
        }
        if (confirmAction.type === 'kick') {
            if (confirmAction.isSelf) {
                return `Tu es sur le point de te kick toi-même (${confirmAction.playerName}). Continuer ?`;
            }
            return `Kick ${confirmAction.playerName} de ce salon ?`;
        }
        if (confirmAction.type === 'join') {
            return `Rejoindre le salon ${confirmAction.serverName || confirmAction.serverCode} ?`;
        }
        return '';
    })();

    const renderServerButton = (server) => (
        <li key={server._id} className="server-list__item">
            <button
                type="button"
                className="server-list__link"
                style={{ width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                onClick={() => openServerDetail(server.code)}
            >
                <BlasonServerViewer imageIndex={server.blason?.blason} size="3.25rem" />
                <div className="server-list__info">
                    <span className="server-list__name">{server.name}</span>
                    <span className="server-list__meta">
                        <FaUserGroup aria-hidden="true" />
                        {countOnlinePlayers(server)} en ligne · {server.players?.length || 0} joueurs · {server.code}
                    </span>
                </div>
                <FaChevronRight className="server-list__chevron" aria-hidden="true" />
            </button>
        </li>
    );

    const menuItems = [
        { key: 'actions', label: 'Actions', Icon: FaShieldHalved },
        { key: 'sockets', label: 'Sockets connectées', Icon: FaPlug },
        { key: 'servers', label: 'Salons actifs', Icon: FaUserGroup },
    ];

    return (
        <div className="tab-screen salons-view admin-view">
            <div className="salons-panel admin-view__panel">
                <h2 className="salons-panel__title">Administration</h2>
                <div className="admin-menu">
                    {menuItems.map(({ key, label, Icon }) => (
                        <button
                            key={key}
                            type="button"
                            className="admin-menu__item"
                            onClick={() => setOpenPanel(key)}
                        >
                            <Icon aria-hidden="true" />
                            <span>{label}</span>
                            <FaChevronRight aria-hidden="true" />
                        </button>
                    ))}
                </div>
            </div>

            <Modal
                title="Actions"
                isOpen={openPanel === 'actions'}
                onClose={() => setOpenPanel(null)}
            >
                <div className="modal_content" style={{ alignItems: 'stretch', gap: '0.85rem' }}>
                    <button
                        type="button"
                        className="btn-push btn-push-red"
                        style={{ padding: '0.85rem 1rem', fontSize: '0.95rem', width: '100%' }}
                        onClick={() => setConfirmAction({ type: 'disconnectAll' })}
                    >
                        Déconnecter tous
                    </button>
                    <button
                        type="button"
                        className="btn-push btn-push-red"
                        style={{ padding: '0.85rem 1rem', fontSize: '0.95rem', width: '100%' }}
                        onClick={() => setConfirmAction({ type: 'resetPictures' })}
                    >
                        Reset photos
                    </button>
                </div>
            </Modal>

            <Modal
                title={`Sockets connectées (${sockets.length})`}
                isOpen={openPanel === 'sockets'}
                onClose={() => setOpenPanel(null)}
                maxHeight="min(85dvh, calc(100dvh - 2rem))"
            >
                <div className="modal_content admin-modal-body">
                    {sockets.length === 0 ? (
                        <p className="server-list__empty">Aucune socket.</p>
                    ) : (
                        <ul className="admin-socket-list admin-socket-list--modal">
                            {sockets.map((entry) => {
                                const isSelf = entry.userId === userId;
                                return (
                                    <li key={entry.socketId} className="admin-socket-list__item">
                                        <div className="admin-socket-list__identity">
                                            <PlayerAvatar picture={entry.userPicture} />
                                            <div>
                                                <strong>
                                                    {entry.userName || 'Inconnu'}
                                                    {isSelf ? ' (vous)' : ''}
                                                </strong>
                                                <span>{entry.userId} · {entry.userRole}</span>
                                                <span>Depuis {formatConnectedSince(entry.connectedAt)}</span>
                                                {(entry.serverCodes?.length > 0 || entry.observing?.length > 0) && (
                                                    <span>
                                                        {entry.serverCodes?.join(', ')}
                                                        {entry.observing?.length ? ` · obs: ${entry.observing.join(', ')}` : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="admin-socket-list__actions">
                                            <button
                                                type="button"
                                                className="btn-push btn-push-blue"
                                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                                                onClick={() => openUserProfile(entry.userId)}
                                                aria-label={`Voir le profil de ${entry.userName || entry.userId}`}
                                            >
                                                <FaUser aria-hidden="true" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-push"
                                                style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                                                onClick={() => setConfirmAction({
                                                    type: 'disconnectSocket',
                                                    socketId: entry.socketId,
                                                    userName: entry.userName || 'cette socket',
                                                    isSelf,
                                                })}
                                            >
                                                Déco
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </Modal>

            <Modal
                title="Salons actifs"
                isOpen={openPanel === 'servers' && !selectedServer}
                onClose={closeServersFlow}
                maxHeight="min(85dvh, calc(100dvh - 2rem))"
            >
                <div className="modal_content admin-modal-body">
                    {occupiedServers.length === 0 ? (
                        <p className="server-list__empty">Aucun salon actif.</p>
                    ) : (
                        <ul className="server-list admin-server-list">
                            {occupiedServers.map(renderServerButton)}
                        </ul>
                    )}

                    {emptyServers.length > 0 && (
                        <div className="admin-empty-servers">
                            <button
                                type="button"
                                className="admin-empty-servers__toggle"
                                onClick={() => setShowEmptyServers((open) => !open)}
                                aria-expanded={showEmptyServers}
                            >
                                <span>Salons vides ({emptyServers.length})</span>
                                <FaChevronDown
                                    aria-hidden="true"
                                    style={{
                                        transform: showEmptyServers ? 'rotate(180deg)' : 'none',
                                        transition: 'transform 0.15s ease',
                                    }}
                                />
                            </button>
                            {showEmptyServers && (
                                <ul className="server-list admin-server-list">
                                    {emptyServers.map(renderServerButton)}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </Modal>

            <Modal
                title={selectedServer ? selectedServer.name : 'Salon'}
                isOpen={Boolean(selectedServer)}
                onBack={backToServers}
                onClose={closeServersFlow}
                maxHeight="min(85dvh, calc(100dvh - 2rem))"
            >
                {selectedServer && (
                    <div className="modal_content admin-modal-body" style={{ alignItems: 'stretch' }}>
                        <p style={{ margin: 0 }}>
                            Code <strong>{selectedServer.code}</strong> · statut {selectedServer.gameStatus}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                className="btn-push btn-push-blue"
                                style={{ padding: '0.55rem 1rem', fontSize: '0.9rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}
                                onClick={() => navigate(`/server/${selectedServer.code}?observe=1`)}
                            >
                                <FaEye aria-hidden="true" /> Observer
                            </button>
                            <button
                                type="button"
                                className="btn-push btn-push-gray"
                                style={{ padding: '0.55rem 1rem', fontSize: '0.9rem' }}
                                onClick={() => setConfirmAction({
                                    type: 'join',
                                    serverCode: selectedServer.code,
                                    serverName: selectedServer.name,
                                })}
                            >
                                Rejoindre
                            </button>
                        </div>
                        <ul className="admin-player-list admin-player-list--modal">
                            {(selectedServer.players || []).map((player) => {
                                const isSelf = player.userId === userId;
                                return (
                                    <li key={player.userId || player.userName} className="admin-player-list__item">
                                        <button
                                            type="button"
                                            className="admin-player-list__identity admin-player-list__identity--button"
                                            onClick={() => openUserProfile(player.userId)}
                                        >
                                            <PlayerAvatar picture={player.userPicture} />
                                            <div>
                                                <strong>
                                                    {player.userName}
                                                    {isSelf ? ' (vous)' : ''}
                                                </strong>
                                                <span>
                                                    {player.role} · {player.state}
                                                    {player.state === 'online' ? ` · ${formatConnectedSince(player.connectedAt)}` : ''}
                                                </span>
                                                <span>{player.score ?? 0} pts · {player.wins ?? 0} wins</span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-push"
                                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                                            onClick={() => setConfirmAction({
                                                type: 'kick',
                                                playerId: player.userId,
                                                playerName: player.userName || 'ce joueur',
                                                isSelf,
                                            })}
                                        >
                                            Kick
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </Modal>

            <Modal
                title="Profil"
                isOpen={Boolean(profileDetails)}
                onClose={() => setProfileDetails(null)}
            >
                {profileDetails && (
                    <div className="modal_content" style={{ alignItems: 'stretch', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <PlayerAvatar picture={profileDetails.userPicture} size="5.5rem" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0 }}>
                                <h2 style={{ margin: 0 }}>{profileDetails.userName}</h2>
                                <span>{profileDetails.userRole === 'admin' ? 'Administrateur' : 'Utilisateur'}</span>
                                <span style={{ opacity: 0.75, fontSize: '0.85rem' }}>{profileDetails.userId}</span>
                            </div>
                        </div>
                        {profileDetails.creation && (
                            <p style={{ margin: 0 }}>
                                Inscrit le {format(new Date(profileDetails.creation), "dd/MM/yyyy 'à' HH'h'mm")}
                            </p>
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                title="Confirmer"
                isOpen={Boolean(confirmAction)}
                onClose={() => setConfirmAction(null)}
            >
                <div className="modal_content" style={{ gap: '1rem' }}>
                    <p style={{ margin: 0, textAlign: 'center' }}>
                        {confirmMessage}
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                        <button
                            type="button"
                            className="btn-push btn-push-gray"
                            style={{ flex: 1, padding: '0.75rem' }}
                            onClick={() => setConfirmAction(null)}
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            className="btn-push btn-push-red"
                            style={{ flex: 1, padding: '0.75rem' }}
                            onClick={runConfirmedAction}
                        >
                            Confirmer
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default AdminView;

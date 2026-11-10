import { useEffect, useMemo, useState } from 'react';
import { FaTrash } from 'react-icons/fa6';
import { useUser } from '../../UserContext.jsx';
import { useSocket } from '../../SocketContext.jsx';
import config from '../../config';
import { useToken } from '../../TokenContext.jsx';
import ServerList from './ServerList.jsx';
import Modal from '../modal/Modal.jsx';
import { useWatchedServers } from '../../hooks/useWatchedServers.js';

function UserHistory() {
    const token = useToken();
    const socket = useSocket();
    const { userId } = useUser();
    const [userServers, setUserServers] = useState([]);
    const [selectedCodes, setSelectedCodes] = useState([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    useWatchedServers(socket, userServers);

    const allCodes = useMemo(
        () => userServers.map((server) => server.code).filter(Boolean),
        [userServers]
    );
    const selectedCount = selectedCodes.length;
    const allSelected = allCodes.length > 0 && selectedCount === allCodes.length;

    useEffect(() => {
        setSelectedCodes((prev) => {
            const next = prev.filter((code) => allCodes.includes(code));
            return next.length === prev.length ? prev : next;
        });
    }, [allCodes]);

    useEffect(() => {
        const onPlayersUpdate = (updatedServer) => {
            setUserServers((prevServers) =>
                prevServers
                    .map((server) =>
                        server._id === updatedServer._id ? updatedServer : server
                    )
                    .filter((server) =>
                        server.players?.some((player) => player.user?.userId === userId)
                    )
            );
        };

        const onHistoryRemoved = ({ codes } = {}) => {
            const removed = Array.isArray(codes) ? codes : [];
            setIsRemoving(false);
            setConfirmOpen(false);
            if (removed.length === 0) {
                return;
            }
            setUserServers((prev) => prev.filter((server) => !removed.includes(server.code)));
            setSelectedCodes((prev) => prev.filter((code) => !removed.includes(code)));
        };

        const onServerDeleted = ({ serverCode } = {}) => {
            if (!serverCode) {
                return;
            }
            setUserServers((prev) => prev.filter((server) => server.code !== serverCode));
            setSelectedCodes((prev) => prev.filter((code) => code !== serverCode));
        };

        socket.on('playersUpdate', onPlayersUpdate);
        socket.on('historyRemoved', onHistoryRemoved);
        socket.on('serverDeleted', onServerDeleted);
        return () => {
            socket.off('playersUpdate', onPlayersUpdate);
            socket.off('historyRemoved', onHistoryRemoved);
            socket.off('serverDeleted', onServerDeleted);
        };
    }, [socket, userId]);

    useEffect(() => {
        const fetchUserServers = async () => {
            try {
                const response = await fetch(config.serverUrl + '/user-servers', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const servers = await response.json();
                setUserServers(Array.isArray(servers) ? servers : []);
            } catch (error) {
                console.error('Error fetching user servers:', error);
            }
        };

        fetchUserServers();
    }, [socket, token, userId]);

    const toggleSelect = (code) => {
        setSelectedCodes((prev) =>
            prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
        );
    };

    const toggleSelectAll = () => {
        setSelectedCodes(allSelected ? [] : allCodes);
    };

    const confirmMessage = selectedCount === 1
        ? 'Retirer ce salon de ton historique ?'
        : `Retirer ${selectedCount} salons de ton historique ?`;

    const handleConfirmRemove = () => {
        if (selectedCount === 0 || isRemoving) {
            return;
        }
        setIsRemoving(true);
        socket.emit('removeFromHistory', { codes: selectedCodes });
    };

    return (
        <div className="history-list">
            {selectedCount > 0 && (
                <div className="history-toolbar">
                    <button
                        type="button"
                        className="btn-push btn-push-gray history-toolbar__select"
                        onClick={toggleSelectAll}
                    >
                        {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </button>
                    <button
                        type="button"
                        className="btn-push history-toolbar__delete"
                        onClick={() => setConfirmOpen(true)}
                    >
                        <FaTrash aria-hidden="true" />
                        Supprimer ({selectedCount})
                    </button>
                </div>
            )}

            <ServerList
                servers={userServers}
                emptyMessage="Tu n'as rejoint aucun salon pour le moment."
                selectable
                selectedCodes={selectedCodes}
                onToggleSelect={toggleSelect}
            />

            <Modal
                title="Confirmer"
                isOpen={confirmOpen}
                onClose={() => {
                    if (!isRemoving) {
                        setConfirmOpen(false);
                    }
                }}
            >
                <div className="modal_content" style={{ gap: '1rem' }}>
                    <p style={{ margin: 0, textAlign: 'center' }}>{confirmMessage}</p>
                    <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                        <button
                            type="button"
                            className="btn-push btn-push-gray"
                            style={{ flex: 1, padding: '0.75rem' }}
                            disabled={isRemoving}
                            onClick={() => setConfirmOpen(false)}
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            className="btn-push"
                            style={{ flex: 1, padding: '0.75rem' }}
                            disabled={isRemoving}
                            onClick={handleConfirmRemove}
                        >
                            Confirmer
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default UserHistory;

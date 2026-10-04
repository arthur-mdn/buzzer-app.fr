// GameContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext.jsx';

const GameContext = createContext();

function dedupePlayers(players = []) {
    const byUser = new Map();

    for (const player of players) {
        const id = player?.user?._id || player?.user?.userId;
        if (!id) continue;

        const key = String(id);
        const existing = byUser.get(key);
        if (!existing) {
            byUser.set(key, player);
            continue;
        }

        byUser.set(key, {
            ...existing,
            ...player,
            score: Math.max(existing.score || 0, player.score || 0),
            wins: Math.max(existing.wins || 0, player.wins || 0),
            state: player.state === 'online' || existing.state === 'online' ? 'online' : existing.state,
            role: player.role === 'host' || existing.role === 'host' ? 'host' : existing.role,
        });
    }

    return Array.from(byUser.values());
}

export function useGame() {
    return useContext(GameContext);
}

export function GameProvider({ children , initialGameState, initialGameOptions, initialBuzzOrder, initialPlayers }) {
    const socket = useSocket();
    const [gameState, setGameState] = useState(initialGameState || 'waiting');
    const [message, setMessage] = useState('');
    const [buzzOrder, setBuzzOrder] = useState(initialBuzzOrder || []);
    const [players, setPlayers] = useState(() => dedupePlayers(initialPlayers || []));
    // options of the server
    const [options, setOptions] = useState(initialGameOptions || {});
    const [animationType, setAnimationType] = useState('none');

    useEffect(() => {

        socket.on('gameStarted', () => {
            setGameState('inProgress');
            setMessage('La manche a commencé !');
        });
        socket.on('gameReStarted', ({server}) => {
            setGameState('waiting');
            setMessage('La partie va recommencer !');
            // setBuzzOrder(server.buzzOrder);
            setGameState(server.gameStatus);
            setOptions(server.options);
            setPlayers(dedupePlayers(server.players));
        });

        socket.on('gameCancelled', () => {
            setGameState('waiting');
            setMessage('La manche a été annulée.');
        });

        socket.on('playerBuzzed', ({ server }) => {
            setBuzzOrder(server.buzzOrder);
            setGameState(server.gameStatus);
            setOptions(server.options);
        });

        socket.on('answerAccepted', ({ server }) => {
            setBuzzOrder(server.buzzOrder);
            setGameState(server.gameStatus);
            setPlayers(dedupePlayers(server.players));
            setOptions(server.options);
            setMessage('Réponse valide !')
            setAnimationType('correct');
        });
        socket.on('answerWon', ({ server }) => {
            setBuzzOrder(server.buzzOrder);
            setGameState(server.gameStatus);
            setPlayers(dedupePlayers(server.players));
            setOptions(server.options);
            setMessage('Réponse gagnante !')
        });
        socket.on('answerDeclined', ({ server }) => {
            setBuzzOrder(server.buzzOrder);
            setGameState(server.gameStatus);
            setPlayers(dedupePlayers(server.players));
            setOptions(server.options);
            setMessage('Réponse incorrecte !')
            setAnimationType('wrong');
        });
        const handlePlayersUpdate = (updatedServer) => {
            if (Array.isArray(updatedServer?.players)) {
                setPlayers(dedupePlayers(updatedServer.players));
            }
            if (updatedServer?.options) {
                setOptions(updatedServer.options);
            }
        };
        socket.on('playersUpdate', handlePlayersUpdate);

        const handleOptionsUpdate = (newOptions) => {
            setOptions(newOptions);
        };
        socket.on('serverOptionsUpdated', handleOptionsUpdate);

        socket.on('error', console.error);
        return () => {
            socket.off('playersUpdate', handlePlayersUpdate);
            socket.off('gameStarted');
            socket.off('gameCancelled');
            socket.off('serverOptionsUpdated', handleOptionsUpdate);
        };
    }, [socket]);

    const value = {
        gameState,
        message,
        setGameState,
        setMessage,
        buzzOrder,
        players,
        setPlayers,
        options,
        animationType,
        setAnimationType
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

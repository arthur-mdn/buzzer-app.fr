import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext.jsx';
import { eventMatchesServer } from './utils/serverEvent.js';

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

export function GameProvider({
    children,
    serverCode,
    initialGameState,
    initialGameOptions,
    initialBuzzOrder,
    initialPlayers,
}) {
    const socket = useSocket();
    const [gameState, setGameState] = useState(initialGameState || 'waiting');
    const [message, setMessage] = useState('');
    const [buzzOrder, setBuzzOrder] = useState(initialBuzzOrder || []);
    const [players, setPlayers] = useState(() => dedupePlayers(initialPlayers || []));
    const [options, setOptions] = useState(initialGameOptions || {});
    const [animationType, setAnimationType] = useState('none');
    const [serverError, setServerError] = useState(null);

    useEffect(() => {
        const handleGameStarted = (payload) => {
            if (!eventMatchesServer(payload ?? { serverCode }, serverCode)) return;
            setGameState('inProgress');
            setMessage('La manche a commencé !');
        };

        const handleGameReStarted = (payload) => {
            if (!eventMatchesServer(payload, serverCode)) return;
            const server = payload.server;
            setMessage('La partie va recommencer !');
            setGameState(server.gameStatus);
            setOptions(server.options);
            setPlayers(dedupePlayers(server.players));
            if (Array.isArray(server.buzzOrder)) {
                setBuzzOrder(server.buzzOrder);
            }
        };

        const handleGameCancelled = (payload) => {
            if (!eventMatchesServer(payload ?? { serverCode }, serverCode)) return;
            setGameState('waiting');
            setMessage('La manche a été annulée.');
        };

        const handlePlayerBuzzed = (payload) => {
            if (!eventMatchesServer(payload, serverCode)) return;
            const server = payload.server;
            setBuzzOrder(server.buzzOrder);
            setGameState(server.gameStatus);
            setOptions(server.options);
        };

        const handleAnswerAccepted = (payload) => {
            if (!eventMatchesServer(payload, serverCode)) return;
            const server = payload.server;
            setBuzzOrder(server.buzzOrder);
            setGameState(server.gameStatus);
            setPlayers(dedupePlayers(server.players));
            setOptions(server.options);
            setMessage('Réponse valide !');
            setAnimationType('correct');
        };

        const handleAnswerWon = (payload) => {
            if (!eventMatchesServer(payload, serverCode)) return;
            const server = payload.server;
            setBuzzOrder(server.buzzOrder);
            setGameState(server.gameStatus);
            setPlayers(dedupePlayers(server.players));
            setOptions(server.options);
            setMessage('Réponse gagnante !');
        };

        const handleAnswerDeclined = (payload) => {
            if (!eventMatchesServer(payload, serverCode)) return;
            const server = payload.server;
            setBuzzOrder(server.buzzOrder);
            setGameState(server.gameStatus);
            setPlayers(dedupePlayers(server.players));
            setOptions(server.options);
            setMessage('Réponse incorrecte !');
            setAnimationType('wrong');
        };

        const handlePlayersUpdate = (updatedServer) => {
            if (!eventMatchesServer(updatedServer, serverCode)) return;
            if (Array.isArray(updatedServer?.players)) {
                setPlayers(dedupePlayers(updatedServer.players));
            }
            if (updatedServer?.options) {
                setOptions(updatedServer.options);
            }
            if (updatedServer?.gameStatus) {
                setGameState(updatedServer.gameStatus);
            }
            if (Array.isArray(updatedServer?.buzzOrder)) {
                setBuzzOrder(updatedServer.buzzOrder);
            }
        };

        const handleOptionsUpdate = (payload) => {
            if (!eventMatchesServer(payload, serverCode)) return;
            setOptions(payload.options ?? payload);
        };

        const handleServerError = ({ message: errorMessage } = {}) => {
            const text = errorMessage || 'Une erreur est survenue';
            setServerError(text);
            setMessage(text);
        };

        const handleSocketError = (error) => {
            console.error(error);
        };

        socket.on('gameStarted', handleGameStarted);
        socket.on('gameReStarted', handleGameReStarted);
        socket.on('gameCancelled', handleGameCancelled);
        socket.on('playerBuzzed', handlePlayerBuzzed);
        socket.on('answerAccepted', handleAnswerAccepted);
        socket.on('answerWon', handleAnswerWon);
        socket.on('answerDeclined', handleAnswerDeclined);
        socket.on('playersUpdate', handlePlayersUpdate);
        socket.on('serverOptionsUpdated', handleOptionsUpdate);
        socket.on('serverError', handleServerError);
        socket.on('error', handleSocketError);

        return () => {
            socket.off('gameStarted', handleGameStarted);
            socket.off('gameReStarted', handleGameReStarted);
            socket.off('gameCancelled', handleGameCancelled);
            socket.off('playerBuzzed', handlePlayerBuzzed);
            socket.off('answerAccepted', handleAnswerAccepted);
            socket.off('answerWon', handleAnswerWon);
            socket.off('answerDeclined', handleAnswerDeclined);
            socket.off('playersUpdate', handlePlayersUpdate);
            socket.off('serverOptionsUpdated', handleOptionsUpdate);
            socket.off('serverError', handleServerError);
            socket.off('error', handleSocketError);
        };
    }, [socket, serverCode]);

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
        setAnimationType,
        serverError,
        setServerError,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

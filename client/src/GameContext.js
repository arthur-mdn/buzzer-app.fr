// GameContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

const GameContext = createContext();

export function useGame() {
    return useContext(GameContext);
}

export function GameProvider({ children , initialGameState, initialGameOptions, initialBuzzOrder, initialPlayers }) {
    const socket = useSocket();
    const [gameState, setGameState] = useState(initialGameState || 'waiting');
    const [message, setMessage] = useState('');
    const [buzzOrder, setBuzzOrder] = useState(initialBuzzOrder || []);
    const [players, setPlayers] = useState(initialPlayers || []);
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
            setPlayers(server.players)
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
            setPlayers(server.players);
            setOptions(server.options);
            setMessage('Réponse valide !')
            setAnimationType('correct');
        });
        socket.on('answerWon', ({ server }) => {
            setBuzzOrder(server.buzzOrder);
            setGameState(server.gameStatus);
            setPlayers(server.players);
            setOptions(server.options);
            setMessage('Réponse gagnante !')
        });
        socket.on('answerDeclined', ({ server }) => {
            setBuzzOrder(server.buzzOrder);
            setGameState(server.gameStatus);
            setPlayers(server.players);
            setOptions(server.options);
            setMessage('Réponse incorrecte !')
            setAnimationType('wrong');
        });
        const handlePlayersUpdate = (updatedServer) => {
            setPlayers(updatedServer.players);
            setOptions(updatedServer.options);
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

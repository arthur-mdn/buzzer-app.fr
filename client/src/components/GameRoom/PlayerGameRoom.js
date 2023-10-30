// GameRoom.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

function GameRoom() {
    const { serverCode } = useParams();
    const [serverInfo, setServerInfo] = useState(null);
    const [role, setRole] = useState(''); // 'host' ou 'participant'
    const [gameState, setGameState] = useState('waiting'); // 'waiting', 'inProgress', 'ended'
    const [message, setMessage] = useState('');
    const socketRef = useRef();
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        // Fonction pour récupérer les détails du serveur
        const fetchServerDetails = async () => {
            try {
                // Récupérer l'userId du localStorage
                const userId = localStorage.getItem('userId');

                const response = await fetch(`http://localhost:3001/server/${serverCode}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'UserId': userId // Ajouter l'userId aux en-têtes de la requête
                    }
                });
                const data = await response.json();

                setServerInfo(data.server);
                setRole(data.role);
            } catch (error) {
                console.error('There was an error fetching the server details:', error);
            }
        };

        fetchServerDetails();

        // Initialisation de Socket.io
        socketRef.current = io('http://localhost:3001'); // Utilisez useRef pour conserver la référence du socket

        // Écouter les mises à jour de la liste des joueurs
        socketRef.current.on('playersUpdate', (updatedPlayers) => {
            setPlayers(updatedPlayers);
        });

        // Écouteurs d'événements pour les changements d'état du jeu
        socketRef.current.on('gameStarted', () => {
            console.log("gameStarted event received"); // log pour le débogage
            setGameState('inProgress');
            setMessage('La partie a commencé !');
        });


        socketRef.current.on('playerBuzzed', ({ userId }) => {
            // Si l'utilisateur est l'hôte, afficher le message approprié
            setMessage(`Le joueur ${userId} a buzzé !`);
            // Si l'utilisateur est un joueur, vous pouvez gérer d'autres logiques ici
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [serverCode]);

    // Déplacez vos gestionnaires ici, à l'extérieur de useEffect mais à l'intérieur de GameRoom
    const handleStartGame = () => {
        if (socketRef.current) {
            socketRef.current.emit('startGame', { serverCode });
        }
    };

    const handleBuzz = () => {
        const userId = localStorage.getItem('userId');
        if (socketRef.current) {
            socketRef.current.emit('buzz', { userId, serverCode });
        }
    };

    const handleAcceptAnswer = () => {
        // Implementez la logique ici
    };

    const handleDeclineAnswer = () => {
        // Implementez la logique ici
    };

    if (!serverInfo) {
        return <div>Loading...</div>; // Ou tout autre composant de chargement
    }
    console.log(serverInfo)




    return (
        <div>
            <h1>{serverInfo.name}</h1>
            <p>{message}</p>
            {role === 'host' ? (
                <div>
                    {/* Vue pour l'hôte */}
                    <h2>Joueurs:</h2>
                    <ul>
                        {players.map((player, index) => (
                            <li key={index}>{player.userId} - {player.state}</li>
                        ))}
                    </ul>
                    {gameState === 'waiting' && <button onClick={handleStartGame}>Démarrer le jeu</button>}
                    {/* Vous pouvez également ajouter ici des boutons pour accepter/refuser des réponses, etc. */}
                    {gameState === 'inProgress' && (
                        <>
                            <button onClick={handleAcceptAnswer}>Accepter la réponse</button>
                            <button onClick={handleDeclineAnswer}>Refuser la réponse</button>
                        </>
                    )}
                </div>
            ) : (
                <div>
                    {/* Vue pour les participants */}
                    {gameState === 'inProgress' && <button onClick={handleBuzz}>Buzz</button>}
                    {gameState === 'waiting' && <div>En attente de l'hôte...</div>}
                </div>
            )}
        </div>
    );

}

export default GameRoom;

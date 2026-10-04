import React, { useEffect, useRef } from 'react';
import { useUser } from '../../UserContext.jsx';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../SocketContext.jsx';
import { useGame } from '../../GameContext.jsx';
import Podium from './Podium.jsx';
import GameWaitMessage from './GameWaitMessage.jsx';

function PlayerGameRoom({ serverInfo }) {
    const socket = useSocket();
    const { userId } = useUser();
    const { serverCode } = useParams();
    const { gameState, message, setMessage, buzzOrder, players } = useGame();
    const buzzLockRef = useRef(false);

    useEffect(() => {
        if (gameState === 'inProgress') {
            buzzLockRef.current = false;
        }
    }, [gameState]);

    useEffect(() => {
        if (gameState === 'buzzed' && buzzOrder.length > 0) {
            const latestBuzzer = buzzOrder[0];
            if (latestBuzzer.userId === userId) {
                setMessage('Vous avez buzzé !');
            } else {
                setMessage(`Le joueur ${latestBuzzer.userName} a buzzé !`);
            }
        }
    }, [buzzOrder, gameState, serverInfo, setMessage, userId]);

    useEffect(() => {
        const unlockIfStillPlayable = ({ server } = {}) => {
            if (!server || server.gameStatus === 'inProgress') {
                buzzLockRef.current = false;
            }
        };
        const unlockOnError = () => {
            buzzLockRef.current = false;
        };

        socket.on('playerBuzzed', unlockIfStillPlayable);
        socket.on('serverError', unlockOnError);
        return () => {
            socket.off('playerBuzzed', unlockIfStillPlayable);
            socket.off('serverError', unlockOnError);
        };
    }, [socket]);

    const handleBuzz = (event) => {
        event?.preventDefault?.();
        if (gameState !== 'inProgress' || buzzLockRef.current || !socket) {
            return;
        }

        buzzLockRef.current = true;
        setMessage('Buzz envoyé...');
        socket.emit('buzz', { serverCode });
    };

    return (
        <div style={{ padding: '2rem 2rem 0 2rem' }}>
            <p>{message}</p>
            {gameState === 'win' && (
                <div className={'modal_bg'}>
                    <div className={'modal'}>
                        <div className={'modal_content_title'}>
                            <h2>Victoire !</h2>
                        </div>
                        <div className={'modal_content'}>
                            <Podium players={players} />
                        </div>
                    </div>
                </div>
            )}
            {(gameState === 'inProgress' || gameState === 'buzzed') && (
                <div className="btn-container">
                    <button
                        type="button"
                        className="btn"
                        id="big-red-button"
                        aria-label="Buzzer"
                        onPointerDown={handleBuzz}
                        onClick={handleBuzz}
                        disabled={gameState !== 'inProgress'}
                    >
                        <span className="back" aria-hidden="true"></span>
                        <span className="front" aria-hidden="true"></span>
                        <span className="base" aria-hidden="true"></span>
                    </button>
                </div>
            )}
            {gameState === 'waiting' && (
                <GameWaitMessage
                    title="En attente de l'hôte"
                    subtitle="Prépare toi, la manche va bientôt commencer"
                />
            )}
        </div>
    );
}

export default PlayerGameRoom;

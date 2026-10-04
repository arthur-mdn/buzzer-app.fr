import React, { useEffect, useRef, useState } from 'react';
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
    const [isPressed, setIsPressed] = useState(false);
    const canBuzz = gameState === 'inProgress';

    useEffect(() => {
        if (canBuzz) {
            buzzLockRef.current = false;
        }
    }, [canBuzz]);

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

    const tryBuzz = () => {
        if (!canBuzz || buzzLockRef.current || !socket) {
            return;
        }

        buzzLockRef.current = true;
        setMessage('Buzz envoyé...');
        socket.emit('buzz', { serverCode });
    };

    const handlePointerDown = (event) => {
        if (event.button != null && event.button !== 0) {
            return;
        }
        event.preventDefault();
        setIsPressed(true);
        tryBuzz();
        event.currentTarget.setPointerCapture?.(event.pointerId);
    };

    const handlePointerUp = () => {
        setIsPressed(false);
    };

    const handlePointerCancel = () => {
        setIsPressed(false);
    };

    const handleKeyDown = (event) => {
        if (event.key !== ' ' && event.key !== 'Enter') {
            return;
        }
        event.preventDefault();
        if (event.repeat) {
            return;
        }
        setIsPressed(true);
        tryBuzz();
    };

    const handleKeyUp = (event) => {
        if (event.key !== ' ' && event.key !== 'Enter') {
            return;
        }
        setIsPressed(false);
    };

    const handleBlur = () => {
        setIsPressed(false);
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
                        className={[
                            'btn',
                            !canBuzz ? 'btn--disabled' : '',
                            isPressed ? 'btn--pressed' : '',
                        ].filter(Boolean).join(' ')}
                        id="big-red-button"
                        aria-label="Buzzer"
                        aria-disabled={!canBuzz}
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        onLostPointerCapture={handlePointerUp}
                        onPointerCancel={handlePointerCancel}
                        onKeyDown={handleKeyDown}
                        onKeyUp={handleKeyUp}
                        onBlur={handleBlur}
                    >
                        <span className="back" aria-hidden="true"></span>
                        <input type="checkbox" className="checkbox" id="Checkbox" tabIndex={-1} aria-hidden="true" readOnly />
                        <label htmlFor="Checkbox" className="front" aria-hidden="true"></label>
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

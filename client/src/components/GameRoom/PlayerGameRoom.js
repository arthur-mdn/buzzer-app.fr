// PlayerGameRoom.js
import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '../../UserContext';
import { useParams } from 'react-router-dom';
import {useSocket} from "../../SocketContext";
import { useGame } from '../../GameContext';
import Podium from './Podium';

function PlayerGameRoom({ serverInfo}) {
    const socket = useSocket();
    const userId = useUser();
    const { serverCode } = useParams();
    const { gameState, message, setMessage, setGameState, buzzOrder, players } = useGame();


    useEffect(() => {
        if (gameState === 'buzzed' && buzzOrder.length > 0) {
            const latestBuzzer = buzzOrder[0];
            if(latestBuzzer.userId === userId){
                setMessage(`Vous avez buzzé !`);
            }else{
                setMessage(`Le joueur ${latestBuzzer.userName} a buzzé !`);
            }
        }
    }, [buzzOrder, gameState, serverInfo, setMessage, userId]);

    // console.log(serverInfo)

    // useEffect(() => {
    //     setGameState(serverInfo.gameStatus);
    //
    //     socket.on('error', (error) => {
    //         console.error('Socket Error:', error);
    //     });
    //
    //     // socket.emit('joinServer', { userId: userId, serverCode: serverCode });
    //
    //     socket.on('gameStarted', () => {
    //         setGameState('inProgress');
    //         console.log("go")
    //         setMessage('La partie a commencé !');
    //     });
    //     socket.on('gameCancelled', () => {
    //         setGameState('waiting');
    //         setMessage('La partie a été annulée.');
    //     });
    // }, [serverCode, socket, userId]);

    const handleBuzz = () => {
        if (socket) {
            socket.emit('buzz', { serverCode });
        }
    };

    return (
        <div style={{padding:'2rem 2rem 0 2rem'}}>
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
            {(gameState === 'inProgress' || gameState === 'buzzed' ) &&
                <div className="btn-container">
                    {gameState === 'inProgress' ? <button className="btn" id={'big-red-button'} onClick={handleBuzz}>
                            <span className="back"></span>
                            <input type="checkbox" className="checkbox" id="Checkbox"/>
                                <label htmlFor="Checkbox" className="front"></label>
                                <span className="base"></span>
                        </button>
                    : <button className="btn" id={'big-red-button'} onClick={handleBuzz} disabled>
                    <span className="back"></span>
                    <input type="checkbox" className="checkbox" id="Checkbox"  onclick="event.stopPropagation()"/>
                        <label htmlFor="Checkbox" className="front"></label>
                        <span className="base"></span>
                    </button>}
                </div>}
            {gameState === 'waiting' && <div>En attente de l'hôte...</div>}
        </div>
    );
}

export default PlayerGameRoom;

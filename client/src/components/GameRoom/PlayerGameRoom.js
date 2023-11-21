// PlayerGameRoom.js
import React, { useEffect } from 'react';
import { useUser } from '../../UserContext';
import { useParams } from 'react-router-dom';
import {useSocket} from "../../SocketContext";
import { useGame } from '../../GameContext';
import Podium from './Podium';

function PlayerGameRoom({ serverInfo}) {
    const socket = useSocket();
    const userId = useUser();
    const { serverCode } = useParams();
    const { gameState, message, setMessage, buzzOrder, players, animationType, setAnimationType } = useGame();


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

    useEffect(() => {
        if (animationType !== 'none') {
            const timer = setTimeout(() => {
                setAnimationType('none');
            }, 1000); // Réinitialiser l'animation après 1 seconde

            return () => clearTimeout(timer);
        }
    }, [animationType, setAnimationType]);

    const handleBuzz = () => {
        if (socket) {
            socket.emit('buzz', { serverCode });
        }
    };

    return (
        <>
            {animationType === 'wrong' && <div className={"animation wrong"}></div>}
            {animationType === 'correct' && <div className={"animation correct"}></div>}
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
                                <input type="checkbox" className="checkbox" id="Checkbox" onClick="event.stopPropagation()"/>
                                <label htmlFor="Checkbox" className="front"></label>
                                <span className="base"></span>
                            </button>}
                    </div>}
                {gameState === 'waiting' && <div>En attente de l'hôte...</div>}
            </div>
        </>

    );
}

export default PlayerGameRoom;

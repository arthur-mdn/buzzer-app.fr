// HostGameRoom.js
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {useSocket} from "../../SocketContext";
import { useGame } from '../../GameContext';
import Podium from './Podium';

function HostGameRoom({ serverInfo }) {
    const { serverCode } = useParams();
    const { gameState, message, setMessage, buzzOrder, players } = useGame();
    const socket = useSocket();

    useEffect(() => {
        if (gameState === 'buzzed' && buzzOrder.length > 0) {
            // console.log(buzzOrder)
            const latestBuzzer = buzzOrder[0].userName;
            setMessage(`Le joueur ${latestBuzzer} a buzzé !`);
        }
    }, [buzzOrder, gameState, serverInfo, setMessage]);

    // Déplacez vos gestionnaires ici, à l'extérieur de useEffect mais à l'intérieur de GameRoom
    const handleStartGame = () => {
        if (socket) {
            socket.emit('startGame', { serverCode });
        }
    };

    const handleCancelGame = () => {
        if (socket) {
            socket.emit('cancelGame', { serverCode });
        }
    };

    const handleAcceptAnswer = () => {
        console.log("accept")
        socket.emit('acceptAnswer', { userId: buzzOrder[0].userId, serverCode: serverCode });
    };


    const handleDeclineAnswer = () => {
        console.log("decline")
        socket.emit('declineAnswer', { userId: buzzOrder[0].userId, serverCode: serverCode });
    };


    const handleNewGame = () => {
        console.log("handleNewGame")
        socket.emit('newGame', { serverCode: serverCode });
    };



    return (
        <div style={{padding:'2rem 2rem 0 2rem'}}>
            <p>{message}</p>
            <div>
                {gameState === 'win' && (
                    <div className={'modal_bg'}>
                        <div className={'modal'}>
                            <div className={'modal_content_title'}>
                                <h2>Victoire !</h2>
                            </div>
                            <div className={'modal_content'}>
                                <Podium players={players} />
                                <button onClick={handleNewGame} className={'btn-push btn-push-green'} style={{padding: '1rem 1.5rem'}}>Nouvelle manche</button>
                            </div>
                        </div>
                    </div>
                )}
                {gameState === 'waiting' && <button onClick={handleStartGame} className={'btn-push btn-push-green'} style={{padding: '1rem 1.5rem'}} >Démarrer la manche</button>}
                {gameState === 'inProgress' && <button onClick={handleCancelGame} className={'btn-push'} style={{padding: '1rem 1.5rem'}} >Annuler la manche</button>}
                {gameState === 'buzzed' && (
                    <div className={'modal_bg'}>
                        <div className={'modal'}>
                            <div className={'modal_content_title'}>
                                <h2>Nouveau buzz !</h2>
                            </div>
                            <div className={'modal_content'}>
                                <label htmlFor={'name'} style={{width:'100%',textAlign:'left'}}>{message}</label>
                                <button onClick={handleAcceptAnswer} className={'btn-push btn-push-green'} style={{padding: '1rem 1.5rem'}}>Accepter la réponse</button>
                                <button onClick={handleDeclineAnswer} className={'btn-push'} style={{padding: '1rem 1.5rem'}}>Refuser la réponse</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );

}

export default HostGameRoom;

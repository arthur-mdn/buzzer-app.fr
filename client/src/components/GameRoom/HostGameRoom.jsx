// HostGameRoom.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {useSocket} from "../../SocketContext.jsx";
import { useGame } from '../../GameContext.jsx';
import Podium from './Podium.jsx';
import GameWaitMessage from './GameWaitMessage.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

function HostGameRoom({ serverInfo }) {
    const { serverCode } = useParams();
    const { gameState, message, setMessage, buzzOrder, players, options } = useGame();
    const socket = useSocket();
    const { t } = useLanguage();

    useEffect(() => {
        if (gameState === 'buzzed' && buzzOrder.length > 0) {
            // console.log(buzzOrder)
            const latestBuzzer = buzzOrder[0].userName;
            setMessage(t('game.playerBuzzed', { name: latestBuzzer }));
        }
    }, [buzzOrder, gameState, serverInfo, setMessage, t]);

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
    const handleAcceptBonusAnswer = () => {
        console.log("accept with bonus")
        socket.emit('acceptAnswerBonus', { userId: buzzOrder[0].userId, serverCode: serverCode });
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
                                <h2>{t('game.victory')}</h2>
                            </div>
                            <div className={'modal_content'}>
                                <Podium players={players} />
                                <button onClick={handleNewGame} className={'btn-push btn-push-green'} style={{padding: '1rem 1.5rem'}}>{t('game.newRound')}</button>
                            </div>
                        </div>
                    </div>
                )}
                {gameState === 'waiting' && players.length > 1 && (
                    <button onClick={handleStartGame} className="btn-push btn-push-green" style={{ padding: '1rem 1.5rem' }}>
                        {t('game.startRound')}
                    </button>
                )}
                {gameState === 'waiting' && players.length <= 1 && (
                    <GameWaitMessage
                        title={t('game.waitingPlayersTitle')}
                        subtitle={t('game.waitingPlayersSubtitle')}
                    />
                )}
                {gameState === 'inProgress' && <button onClick={handleCancelGame} className={'btn-push'} style={{padding: '1rem 1.5rem'}} >{t('game.cancelRound')}</button>}
                {gameState === 'buzzed' && (
                    <div className={'modal_bg'}>
                        <div className={'modal'}>
                            <div className={'modal_content_title'}>
                                <h2>{t('game.newBuzz')}</h2>
                            </div>
                            <div className={'modal_content'}>
                                <label htmlFor={'name'} style={{width:'100%',textAlign:'left'}}>{message}</label>
                                <button onClick={handleAcceptAnswer} className={'btn-push btn-push-green'} style={{padding: '1rem 1.5rem'}}>{t('game.correctAnswerBtn', { points: options.answerPoint })}</button>
                                <button onClick={handleAcceptBonusAnswer} className={'btn-push btn-push-green'} style={{padding: '1rem 1.5rem'}}>{t('game.bonusAnswerBtn', { points: options.answerPoint + 1 })}</button>
                                <button onClick={handleDeclineAnswer} className={'btn-push'} style={{padding: '1rem 1.5rem'}}>{options.deductPointOnWrongAnswer ? t('game.wrongAnswerPenaltyBtn') : t('game.wrongAnswerBtn')}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );

}

export default HostGameRoom;

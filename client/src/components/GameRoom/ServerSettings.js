// ServerSettings.js
import React, {useState} from 'react';
import {useUser} from "../../UserContext";
import {useGame} from "../../GameContext";
import {useSocket} from "../../SocketContext";
import {useParams} from "react-router-dom";

function ServerSettings() {
    const { userId } = useUser();
    const { options } = useGame();
    const { serverCode } = useParams();
    const socket = useSocket();
    const [serverName, setServerName] = useState('');
    const [winPoint, setWinPoint] = useState(options.winPoint);
    const [answerPoint, setAnswerPoint] = useState(options.answerPoint);
    const [deductPointOnWrongAnswer, setDeductPointOnWrongAnswer] = useState(options.deductPointOnWrongAnswer);
    const [autoRestartAfterDecline, setAutoRestartAfterDecline] = useState(options.autoRestartAfterDecline);


    const handleSaveSettings = () => {
        const newOptions = {
            winPoint,
            answerPoint,
            deductPointOnWrongAnswer,
            autoRestartAfterDecline
        };

        // Envoyer les nouvelles options au serveur
        socket.emit('updateServerOptions', { serverCode, newOptions });

        // Ou utilisez une requête HTTP si nécessaire
        // fetch('/api/updateServerOptions', { /* ... */ });
    };

    return (
        <div className={"tab-content"} style={{height:'100%', overflowY:'scroll'}}>
            <div className={"server-info-rules"}>
                <div className={"server-info-rule"}>
                    <h4 style={{margin:'0'}}>Points nécessaires pour gagner</h4>options
                    <h2 style={{margin:'0'}}>{options.winPoint}</h2>
                </div>
                <div style={{width:"100%", textAlign:"center"}}>
                    <h4 style={{margin:'0'}}>Points gagnés par bonne réponse</h4>
                    <h2 style={{margin:'0'}}>+{options.answerPoint}</h2>
                </div>
                <h6 style={{margin:'0'}}>{options.deductPointOnWrongAnswer}</h6>
            </div>

            <form className={'modal_content'}>
                <div>
                    <label htmlFor="winPoint">Points pour gagner la partie :</label>
                    <input
                        type="range"
                        min="5"
                        max="50"
                        value={winPoint}
                        className={'slider'}

                        onChange={(e) => setWinPoint(Number(e.target.value))}
                    />
                    <span>{winPoint}</span>
                </div>
                <div>
                    <label htmlFor="answerPoint">Points gagnés par bonne réponse :</label>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        value={answerPoint}
                        className={'slider'}
                        onChange={(e) => setAnswerPoint(Number(e.target.value))}
                    />
                    <span>{answerPoint}</span>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={deductPointOnWrongAnswer}
                            onChange={(e) => setDeductPointOnWrongAnswer(e.target.checked)}
                        />
                        Retirer un point par mauvaise réponse.
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={autoRestartAfterDecline}
                            onChange={(e) => setAutoRestartAfterDecline(e.target.checked)}
                        />
                       Engager une nouvelle manche lors d'une mauvaise réponse.
                    </label>
                </div>
                <button type="button" onClick={handleSaveSettings} className={'btn-push btn-push-green'} style={{width: '100%', padding: '1rem'}}>Enregistrer</button>
            </form>
        </div>
    );
}


export default ServerSettings;

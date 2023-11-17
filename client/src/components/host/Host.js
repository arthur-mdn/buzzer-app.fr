// Host.js
import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useUser } from '../../UserContext';
const config = require('../../config');

function Host() {
    const { userId } = useUser();
    const [serverName, setServerName] = useState('');
    const [winPoint, setWinPoint] = useState(10);
    const [answerPoint, setAnswerPoint] = useState(1);
    const [deductPointOnWrongAnswer, setDeductPointOnWrongAnswer] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Envoyer une requête POST au serveur pour créer un nouveau groupe
            const token = localStorage.getItem('token');

            const response = await fetch(config.serverUrl + '/create-server', { // Assurez-vous que l'URL est correcte
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ serverName, userId: userId, options: {
                        winPoint,
                        answerPoint,
                        deductPointOnWrongAnswer
                    } }) // Remplacez 'user-id' par l'ID de l'utilisateur actuel
            });
            console.log(response)
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Extraire le code du serveur de la réponse
            const { code: serverCode } = await response.json();

            // Rediriger vers la page du groupe
            navigate(`/server/${serverCode}`);
        } catch (error) {
            console.error('There was an error creating the server:', error);
        }
    };

    return (
        <div>
            <nav className={'modal_bg'}>
                <div className={'modal'}>
                    <div className={'modal_content_title'}>
                        <h2>Créer un serveur</h2>
                    </div>
                    <form className={'modal_content'} onSubmit={handleSubmit}>
                        <div style={{width:'100%'}}>
                            <label htmlFor={'name'}>Nom du serveur</label>
                            <div style={{display: 'flex', width: '100%', flexDirection:'column'}}>
                                <input type="text"
                                       value={serverName}
                                       onChange={(e) => setServerName(e.target.value)}
                                       required id={'name'} placeholder={'Serveur trop fun'}   />
                            </div>
                        </div>
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
                                Retirer un point par mauvaise réponse
                            </label>
                        </div>
                        <button type="submit" className={'btn-push btn-push-green'} style={{width: '100%', padding: '1rem'}}>Créer</button>
                    </form>
                </div>
            </nav>
            <div className={'z_top'}>
                <Link to="/"  className={'btn-push'} style={{padding: '1rem 1.5rem'}} >{'<'}</Link>
            </div>

        </div>
    );
}

export default Host;

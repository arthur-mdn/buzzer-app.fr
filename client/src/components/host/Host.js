// Host.js
import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { useUser } from '../../UserContext';
import Modal from "../modal/Modal";
import ProfilePictureChooser from "../UserNameInput/ProfilePictureChooser";
import BlasonServerChooser from "./BlasonServerChooser";
const config = require('../../config');

function Host({ onClose }) {
    const { userId } = useUser();
    const [serverName, setServerName] = useState('');
    const [winPoint, setWinPoint] = useState(10);
    const [answerPoint, setAnswerPoint] = useState(1);
    const [deductPointOnWrongAnswer, setDeductPointOnWrongAnswer] = useState(false);
    const [autoRestartAfterDecline, setAutoRestartAfterDecline] = useState(true);
    const [isPublic, setIsPublic] = useState(false);
    const navigate = useNavigate();
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    useEffect(() => {
        // Sélectionnez une image aléatoire lors du premier chargement
        const randomImageNumber = Math.floor(Math.random() * 6) + 1;
        setSelectedImageIndex(randomImageNumber);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let trimmedServerName = serverName.trim();
            if (!trimmedServerName) {
                alert("Le nom du serveur ne peut pas être vide.");
                return;
            }

            if (trimmedServerName.length < 3 || trimmedServerName.length > 30) {
                alert("Le nom du serveur doit contenir entre 3 et 30 caractères.");
                return;
            }

            if (selectedImageIndex == null || selectedImageIndex < 1 || selectedImageIndex > 6) {
                alert("Blason de serveur invalide.");
                return;
            }

            const token = localStorage.getItem('token');

            const response = await fetch(config.serverUrl + '/create-server', { // Assurez-vous que l'URL est correcte
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ serverName, selectedImageIndex, userId: userId, options: {
                        winPoint,
                        answerPoint,
                        deductPointOnWrongAnswer,
                        autoRestartAfterDecline,
                        isPublic
                    } })
            });
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

    const handleImageSelect = (index) => setSelectedImageIndex(index);


    return (
        <div style={{position:"absolute", width:"100vw", height:"100vh", top:'0', bottom:'0'}}>
            <div style={{position:"relative", width:"100%", height:"100%"}}>
                <Modal isOpen={true} title={"Créer un serveur"} onClose={onClose} maxHeight={"60vh"} style={{maxWidth:'none'}}>
                    <form className={'modal_content'} onSubmit={handleSubmit}>
                        <div style={{width:'100%', display:"flex", gap:'15px'}}>
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
                                <label htmlFor={'name'} style={{width:'100%',textAlign:'left'}}>Blason</label>
                                <div style={{display: 'flex', width: '100%', flexDirection:'column'}}>
                                    <BlasonServerChooser onImageSelect={handleImageSelect}
                                                         initialImageIndex={selectedImageIndex}/>
                                </div>
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
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                />
                                Serveur public
                            </label>
                        </div>
                        <button type="submit" className={'btn-push btn-push-green'} style={{width: '100%', padding: '1rem'}}>Créer</button>
                    </form>
                </Modal>
            </div>
        </div>
    );
}

export default Host;

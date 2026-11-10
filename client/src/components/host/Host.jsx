// Host.jsx
import React, {useEffect, useState} from 'react';
import { useNavigate } from "react-router-dom";
import { useUser } from '../../UserContext.jsx';
import Modal from "../modal/Modal.jsx";
import BlasonServerChooser from "./BlasonServerChooser.jsx";
import config from '../../config.js';
import { STORAGE_KEYS, getStorageItem } from '../../utils/storage.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

function Host({ onClose }) {
    const { userId } = useUser();
    const { t } = useLanguage();
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
            const trimmedServerName = serverName.trim();
            if (!trimmedServerName) {
                alert(t('host.nameEmpty'));
                return;
            }

            if (trimmedServerName.length < 3 || trimmedServerName.length > 30) {
                alert(t('host.nameLength'));
                return;
            }

            if (selectedImageIndex == null || selectedImageIndex < 1 || selectedImageIndex > 6) {
                alert(t('host.blasonInvalid'));
                return;
            }

            const token = getStorageItem(STORAGE_KEYS.token);
            console.log(autoRestartAfterDecline + " " + deductPointOnWrongAnswer + " " + isPublic + " " + answerPoint + " " + winPoint)

            const response = await fetch(config.serverUrl + '/create-server', { // Assurez-vous que l'URL est correcte
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ serverName, selectedImageIndex, userId: userId, options: {
                        autoRestartAfterDecline: autoRestartAfterDecline,
                        answerPoint: answerPoint,
                        winPoint: winPoint,
                        deductPointOnWrongAnswer: deductPointOnWrongAnswer,
                        isPublic: isPublic
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
    const handleSliderMouseDown = (e) => {
        e.stopPropagation();
    };
    const handleSliderTouchStart = (e) => {
        e.stopPropagation();
    };
    const handleTouchMove = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
                <Modal isOpen={true} title={t('host.title')} onClose={onClose}>
                    <form className={'modal_content'} onSubmit={handleSubmit}>
                        <div className="host-form__field">
                            <label htmlFor="name">{t('host.nameLabel')}</label>
                            <input
                                type="text"
                                id="name"
                                value={serverName}
                                onChange={(e) => setServerName(e.target.value)}
                                required
                                placeholder={t('host.namePlaceholder')}
                            />
                        </div>

                        <div className="host-form__field">
                            <label>{t('host.blasonLabel')}</label>
                            <BlasonServerChooser
                                onImageSelect={handleImageSelect}
                                initialImageIndex={selectedImageIndex}
                            />
                        </div>
                        <div>
                            <label htmlFor="winPoint">{t('server.options.winPoint')}</label>
                            <input
                                type="range"
                                min="5"
                                max="50"
                                value={winPoint}
                                className={'slider'}
                                onMouseDown={handleSliderMouseDown}
                                onTouchStart={handleSliderTouchStart}
                                onTouchMove={handleTouchMove}
                                onChange={(e) => setWinPoint(Number(e.target.value))}
                            />
                            <span>{winPoint}</span>
                        </div>
                        <div>
                            <label htmlFor="answerPoint">{t('server.options.answerPoint')}</label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={answerPoint}
                                className={'slider'}
                                onMouseDown={handleSliderMouseDown}
                                onTouchStart={handleSliderTouchStart}
                                onTouchMove={handleTouchMove}
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
                                {t('server.options.deductPoint')}
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={autoRestartAfterDecline}
                                    onChange={(e) => setAutoRestartAfterDecline(e.target.checked)}
                                />
                                {t('server.options.autoRestart')}
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                />
                                {t('server.options.public')}
                            </label>
                        </div>
                        <button type="submit" className={'btn-push btn-push-green'} style={{width: '100%', padding: '1rem'}}>{t('home.create')}</button>
                    </form>
                </Modal>
    );
}

export default Host;

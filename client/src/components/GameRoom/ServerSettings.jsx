// ServerSettings.jsx
import React, {useState} from 'react';
import {useGame} from "../../GameContext.jsx";
import {useSocket} from "../../SocketContext.jsx";
import {useParams} from "react-router-dom";
import {FaArrowRotateLeft, FaTrash} from "react-icons/fa6";
import Modal from "../modal/Modal.jsx";
import {FaArrowAltCircleDown, FaArrowAltCircleLeft, FaArrowCircleLeft, FaStop} from "react-icons/fa";
import { useLanguage } from "../../i18n/LanguageContext.jsx";

function ServerSettings() {
    const { options } = useGame();
    const { t } = useLanguage();
    const { serverCode } = useParams();
    const socket = useSocket();
    const [winPoint, setWinPoint] = useState(options.winPoint);
    const [answerPoint, setAnswerPoint] = useState(options.answerPoint);
    const [deductPointOnWrongAnswer, setDeductPointOnWrongAnswer] = useState(options.deductPointOnWrongAnswer);
    const [autoRestartAfterDecline, setAutoRestartAfterDecline] = useState(options.autoRestartAfterDecline);
    const [isPublic, setIsPublic] = useState(options.isPublic);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);

    const handleSaveSettings = () => {
        const newOptions = {
            winPoint,
            answerPoint,
            deductPointOnWrongAnswer,
            autoRestartAfterDecline,
            isPublic
        };
        socket.emit('updateServerOptions', { serverCode, newOptions });
    };

    const handleDelServer = () => {
        socket.emit('delServer', { serverCode });
    };
    const handleResetServer = () => {
        socket.emit('resetScores', { serverCode });
        setShowConfirmResetModal(false);
    };
    const handleOpenConfirmDeleteModal = () => {
        setShowConfirmDeleteModal(true);
    };
    const handleOpenConfirmResetModal = () => {
        setShowConfirmResetModal(true);
    };

    return (
        <>
            <Modal isOpen={showConfirmDeleteModal} title={t('room.confirmDeleteTitle')} onClose={() => setShowConfirmDeleteModal(false)}>
                <div className="modal_content">
                    <p>{t('room.confirmDeleteText')}</p>
                    <button onClick={handleDelServer} className={"btn-push"}>{t('room.deleteRoom')}</button>
                    <button onClick={() => setShowConfirmDeleteModal(false)} className={"btn-push btn-push-gray"}>{t('common.cancel')}</button>
                </div>
            </Modal>
            <Modal isOpen={showConfirmResetModal} title={t('room.confirmResetTitle')} onClose={() => setShowConfirmResetModal(false)}>
                <div className="modal_content">
                    <p>{t('room.confirmResetText')}</p>
                    <button onClick={handleResetServer} className={"btn-push"}>{t('room.resetScores')}</button>
                    <button onClick={() => setShowConfirmResetModal(false)} className={"btn-push btn-push-gray"}>{t('common.cancel')}</button>
                </div>
            </Modal>
            <div className={"tab-content"} style={{height:'100%', overflowY:'scroll', padding:'0'}}>

                <form className={'modal_content'} style={{padding:'1rem', backgroundColor:'transparent'}}>
                    <div>
                        <label htmlFor="winPoint">{t('server.options.winPoint')}</label>
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
                        <label htmlFor="answerPoint">{t('server.options.answerPoint')}</label>
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
                    { (winPoint === options.winPoint && answerPoint === options.answerPoint && deductPointOnWrongAnswer === options.deductPointOnWrongAnswer && autoRestartAfterDecline === options.autoRestartAfterDecline && isPublic === options.isPublic) ?
                        <button type="button" onClick={handleSaveSettings} disabled className={'btn-push btn-push-green'} style={{width: '100%', padding: '1rem'}}>{t('common.save')}</button>
                        :
                        <button type="button" onClick={handleSaveSettings} className={'btn-push btn-push-green'} style={{width: '100%', padding: '1rem'}}>{t('common.save')}</button>
                    }
                    <button type="button" onClick={handleOpenConfirmDeleteModal} className={'btn-push btn-push-red'} style={{padding:'0.5rem 1rem', display:"flex", alignItems:"center", gap:"10px"}}><FaTrash/>{t('room.deleteRoom')}</button>
                    <button type="button" onClick={handleOpenConfirmResetModal} className={'btn-push btn-push-red'} style={{padding:'0.5rem 1rem', display:"flex", alignItems:"center", gap:"10px"}}><FaArrowRotateLeft/>{t('room.resetScores')}</button>
                </form>
            </div>
        </>

    );
}


export default ServerSettings;

// Join.jsx
import React, {useState} from 'react';
import { Link } from "react-router-dom";
import QRCodeScanner from "./QRCodeScanner.jsx";
import config from "../../config";
import Modal from "../modal/Modal.jsx";
import {FaQrcode} from "react-icons/fa6";

function Join({ onClose }) {
    const [tempJoinCode, setTempJoinCode] = useState('');

    const [showScanner, setShowScanner] = useState(false);

    const handleCodeScanned = (decodedText) => {
        setShowScanner(false);
        const serverCodeRegex = new RegExp(`${config.instanceUrl.replace(/\//g, "\\/")}\\/server\\/([\\w-]+)`);
        const match = decodedText.match(serverCodeRegex);

        if (match && match[1]) {
            const serverCode = match[1];
            // Redirection vers la page du serveur
            // console.log(serverCode)
            window.location.href = `${config.instanceUrl}/server/${serverCode}`;
        } else {
            alert("QR Code invalide ou ne contient pas un lien de serveur valide.");
        }
    };

    const handleCodeScanError = (error) => {
        console.error('QR Code Scan Error:', error);
    };

    const handleJoinSubmit = async (e) => {
        e.preventDefault();

        // Normaliser l'entrée et insérer les tirets si nécessaire
        let normalizedJoinCode = tempJoinCode.replace(/[^a-zA-Z0-9]/g, ''); // Supprimer tous les caractères non alphanumériques
        if (normalizedJoinCode.length === 12) {
            normalizedJoinCode = normalizedJoinCode.replace(/(.{4})/g, '$1-').slice(0, -1); // Insérer des tirets tous les 4 caractères
        }

        const validInput = /^[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}$/;

        if (!validInput.test(normalizedJoinCode)) {
            alert("Le code doit être composé de 12 caractères minimum.");
            return;
        }

        try {
            window.location.href = config.instanceUrl + "/server/" + normalizedJoinCode;
        } catch (error) {
            console.error(error);
            alert("Une erreur s'est produite lors de la communication avec le serveur.");
        }
    };

    return (
        <div style={{position:"absolute", width:"100vw", height:"100vh", top:'0', bottom:'0'}}>
            <div style={{position:"relative", width:"100%", height:"100%"}}>
                <Modal isOpen={true} title={"Rejoindre un serveur"} onClose={onClose} marginBottom={"20vh"}  style={{maxWidth:'none'}}>
                        <form className={'modal_content'} onSubmit={handleJoinSubmit} >
                            <label htmlFor={'name'}>Quel serveur rejoindre ?</label>
                            <div style={{display: 'flex', width: '100%', flexDirection:'row', justifyContent:'space-between', gap:'15px'}}>
                                <input type="text" style={{width:'100%'}} value={tempJoinCode} required id={'name'} placeholder={'XXXX - XXXX - XXXX'}  onChange={(e) => setTempJoinCode(e.target.value)}  />
                            </div>
                            <button type="submit" className={'btn-push btn-push-green'} style={{ padding: '1rem 2rem'}}>Rejoindre</button>
                            <button type={"button"} className={'btn-push btn-push-blue'} onClick={() => setShowScanner(true)} style={{padding:'0.5rem 1rem', display:'flex', alignItems:'center',gap:'10px'}}><FaQrcode/>Scan</button>

                        </form>
                </Modal>
                {showScanner &&
                    <Modal isOpen={true} title={"Scanner pour rejoindre"} marginBottom={"20vh"}  onClose={onClose} style={{maxWidth:'none'}}>
                        <QRCodeScanner
                            qrCodeSuccessCallback={handleCodeScanned}
                            qrCodeErrorCallback={handleCodeScanError}
                        />
                    </Modal>
                }
            </div>
        </div>
    );
}

export default Join;

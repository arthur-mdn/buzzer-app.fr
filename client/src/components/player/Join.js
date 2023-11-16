// Join.js
import React, {useState} from 'react';
import { Link } from "react-router-dom";
import config from "../../config";

function Join() {
    const [tempJoinCode, setTempJoinCode] = useState('');

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
    <div>
        <nav className={'modal_bg'}>
            <div className={'modal'}>
                <div className={'modal_content_title'}>
                    <h2>Rejoindre un serveur</h2>
                </div>
                <form className={'modal_content'} onSubmit={handleJoinSubmit} >
                    <label htmlFor={'name'}>Quel serveur rejoindre ?</label>
                    <div style={{display: 'flex', width: '100%', flexDirection:'column'}}>
                        <input type="text"  value={tempJoinCode} required id={'name'} placeholder={'XXXX - XXXX - XXXX'}  onChange={(e) => setTempJoinCode(e.target.value)}  />
                    </div>
                    <button type="submit" className={'btn-push btn-push-green'} style={{width: '100%', padding: '1rem'}}>Rejoindre</button>
                </form>
            </div>
        </nav>
        <div className={'z_top'}>
            <Link to="/"  className={'btn-push'} style={{padding: '1rem 1.5rem'}} >{'<'}</Link>

        </div>

    </div>


    );
}

export default Join;

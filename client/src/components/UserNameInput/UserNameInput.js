// UserNameInput.js

import React, { useState } from 'react';
import {Link} from "react-router-dom";

function UserNameInput({ onSuccess }) {
    const [tempUserName, setTempUserName] = useState('');

    const handleUsernameSubmit = async (e) => {
        e.preventDefault();

        const validInput = /^[\w\s.-]+$/;

// Supprimez les espaces au début et à la fin de la chaîne
        let trimmedUserName = tempUserName.trim();

// Vérifiez si la chaîne est vide après suppression des espaces
        if (!trimmedUserName) {
            alert("Le nom d'utilisateur ne peut pas être vide.");
            return;
        }

// Vérifiez la longueur de la chaîne
        if (trimmedUserName.length < 3 || trimmedUserName.length > 30) {
            alert("Le nom d'utilisateur doit contenir entre 3 et 30 caractères.");
            return;
        }

// Vérifiez si la chaîne correspond à l'expression régulière
        if (!validInput.test(trimmedUserName)) {
            alert("Seuls les lettres, chiffres, tirets, underscores, points et espaces sont autorisés dans le nom d'utilisateur.");
            return;
        }


        try {
            const response = await fetch('http://localhost:3001/registerUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userName: tempUserName }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    localStorage.setItem('userName', tempUserName);
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId);
                    onSuccess(true);

                } else {
                    alert(data.message || "Une erreur s'est produite lors de l'enregistrement du nom d'utilisateur.");
                }
            } else {
                alert("Une erreur s'est produite lors de la communication avec le serveur.");
            }
        } catch (error) {
            console.error(error);
            alert("Une erreur s'est produite lors de la communication avec le serveur.");
        }
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <nav className={'modal_bg'}>
                <div className={'modal'}>
                    <div className={'modal_content_title'}>
                        <h2>Bienvenue !</h2>
                    </div>
                    <form onSubmit={handleUsernameSubmit} className={'modal_content'}>
                        <label htmlFor={'name'} style={{width:'100%',textAlign:'left'}}>Comment dois-je t'appeler ?</label>
                        <div style={{display: 'flex', width: '100%', flexDirection:'column'}}>
                            <input type="text" required id={'name'} placeholder={'John D'} value={tempUserName} minLength={3} maxLength={30} onChange={(e) => setTempUserName(e.target.value)}  />
                        </div>
                        <button type="submit" className={'btn-push btn-push-green'} style={{width: '100%', padding: '1rem'}}>Enregistrer</button>
                    </form>
                </div>
            </nav>
        </div>
    );
}

export default UserNameInput;

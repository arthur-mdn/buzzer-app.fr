// UserNameInput.js
import React, { useState } from 'react';
import config from "../../config";
import ProfilePictureChooser from "./ProfilePictureChooser";

function UserNameInput({ onSuccess }) {
    const [tempUserName, setTempUserName] = useState('');
    const [showPasswordCount, setShowPasswordCount] = useState(0);
    const [tempPassword, setTempPassword] = useState('');
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [selectedColor, setSelectedColor] = useState('#999');
    const incrementShowPasswordCount = () => {
        setShowPasswordCount(showPasswordCount + 1 )
    }
    const handleUsernameSubmit = async (e) => {
        e.preventDefault();

        const validInput = /^[\w\s.-]+$/;

// Supprimez les espaces au début et à la fin de la chaîne
        let trimmedUserName = tempUserName.trim();
        let trimmedPassword = tempPassword.trim();
// Vérifiez si la chaîne est vide après suppression des espaces
        if (!trimmedUserName) {
            alert("Le nom d'utilisateur ne peut pas être vide.");
            return;
        }

        if (!trimmedPassword) {
            trimmedPassword = "basic";
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

        if (selectedImageIndex == null || selectedImageIndex < 1 || selectedImageIndex > 30) {
            alert("Image de profil invalide.");
            return;
        }

        if (selectedColor == null || ['#FF5B37', '#0AA3BB', '#94C114', '#F8CF1D', '#745BB7', '#0CBA8C', '#999'].includes(selectedColor) === false) {
            alert("Couleur de profil invalide.");
            return;
        }


        try {
            const response = await fetch(config.serverUrl+'/registerUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userName: trimmedUserName, userPassword: trimmedPassword, userPictureSmiley: selectedImageIndex, userPictureColor: selectedColor }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    localStorage.setItem('userName', trimmedUserName);
                    localStorage.setItem('token', data.token);
                    onSuccess(true);
                } else {
                    alert(data.message || "Une erreur s'est produite lors de l'enregistrement de l'utilisateur.");
                }
            } else {
                alert("Une erreur s'est produite lors de la communication avec le serveur.");
            }
        } catch (error) {
            console.error(error);
            alert("Une erreur s'est produite lors de la communication avec le serveur.");
        }
    };

    const handleImageSelected = (imageIndex) => {
        setSelectedImageIndex(imageIndex);
    };

    const handleColorSelected = (color) => {
        setSelectedColor(color);
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <nav className={'modal_bg'}>
                <div className={'modal'}>
                    <div className={'modal_content_title'}>
                        <h2 onClick={incrementShowPasswordCount}>Bienvenue !</h2>
                    </div>
                    <form onSubmit={handleUsernameSubmit} className={'modal_content'}>
                        <label htmlFor={'name'} style={{width:'100%',textAlign:'left'}}>Comment dois-je t'appeler ?</label>
                        <div style={{display: 'flex', width: '100%', flexDirection:'column'}}>
                            <input type="text" required id={'name'} placeholder={'John D'} value={tempUserName} minLength={3} maxLength={30} onChange={(e) => setTempUserName(e.target.value)}  />
                        </div>
                        {showPasswordCount > 10 &&
                            <div style={{width: '100%'}}>
                                <label htmlFor={'name'} style={{width:'100%',textAlign:'left'}}>Code secret</label>
                                <div style={{display: 'flex', width: '100%', flexDirection:'column'}}>
                                    <input type="password" id={'password'} placeholder={'******'} value={tempPassword} minLength={3} maxLength={30} onChange={(e) => setTempPassword(e.target.value)}  />
                                </div>
                            </div>
                        }
                        <label htmlFor={'name'} style={{width:'100%',textAlign:'left'}}>Photo de profil</label>
                        <div style={{display: 'flex', width: '100%', flexDirection:'column'}}>
                            <ProfilePictureChooser onImageSelect={handleImageSelected} onColorSelect={handleColorSelected} />
                        </div>

                        <button type="submit" className={'btn-push btn-push-green'} style={{width: '100%', padding: '1rem'}}>Enregistrer</button>
                    </form>
                </div>
            </nav>
        </div>
    );
}

export default UserNameInput;

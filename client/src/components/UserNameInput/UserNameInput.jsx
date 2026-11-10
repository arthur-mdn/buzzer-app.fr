// UserNameInput.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import config from "../../config";
import ProfilePictureChooser from "./ProfilePictureChooser.jsx";
import AboutApp from "../homePage/AboutApp.jsx";
import { normalizeProfileColor, PROFILE_COLORS } from "../../utils/profilePicture.js";
import { STORAGE_KEYS, setStorageItem, getStorageItem } from "../../utils/storage.js";
import { useLanguage } from "../../i18n/LanguageContext.jsx";
import { localePath } from "../../i18n/seoMeta.js";

function UserNameInput({ onSuccess }) {
    const location = useLocation();
    const { t, language } = useLanguage();
    const showBackToLanding = location.pathname === '/jouer' || location.pathname.startsWith('/server/');
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
        const trimmedUserName = tempUserName.trim();
        let trimmedPassword = tempPassword.trim();
// Vérifiez si la chaîne est vide après suppression des espaces
        if (!trimmedUserName) {
            alert(t('auth.nameEmpty'));
            return;
        }

        if (!trimmedPassword) {
            trimmedPassword = "basic";
        }

// Vérifiez la longueur de la chaîne
        if (trimmedUserName.length < 3 || trimmedUserName.length > 30) {
            alert(t('auth.nameLength'));
            return;
        }

// Vérifiez si la chaîne correspond à l'expression régulière
        if (!validInput.test(trimmedUserName)) {
            alert(t('auth.nameChars'));
            return;
        }

        if (selectedImageIndex == null || selectedImageIndex < 1 || selectedImageIndex > 30) {
            alert(t('auth.pictureInvalid'));
            return;
        }

        if (selectedColor == null || !PROFILE_COLORS.includes(normalizeProfileColor(selectedColor))) {
            alert(t('auth.colorInvalid'));
            return;
        }


        try {
            const response = await fetch(config.serverUrl+'/registerUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userName: trimmedUserName,
                    userPassword: trimmedPassword,
                    userPictureSmiley: selectedImageIndex,
                    userPictureColor: selectedColor,
                    userLanguage: getStorageItem(STORAGE_KEYS.language) || language,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setStorageItem(STORAGE_KEYS.userName, trimmedUserName);
                    setStorageItem(STORAGE_KEYS.token, data.token);
                    if (data.refreshToken) {
                        setStorageItem(STORAGE_KEYS.refreshToken, data.refreshToken);
                    }
                    onSuccess(true);
                } else {
                    alert(data.message || t('auth.registerError'));
                }
            } else {
                alert(t('common.serverCommError'));
            }
        } catch (error) {
            console.error(error);
            alert(t('common.serverCommError'));
        }
    };

    const handleImageSelect = (index) => setSelectedImageIndex(index);
    const handleColorSelect = (color) => setSelectedColor(color);
    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <nav className={'modal_bg'}>
                <div className={'modal'}>
                    <div className={'modal_content_title'}>
                        {showBackToLanding && (
                            <Link to={localePath(language)} className="back btn-push" aria-label={t('auth.backHome')}>
                                ‹
                            </Link>
                        )}
                        <h2 onClick={incrementShowPasswordCount}>{t('auth.welcome')}</h2>
                        <AboutApp />
                    </div>
                    <form onSubmit={handleUsernameSubmit} className={'modal_content'}>
                        <label htmlFor={'name'} style={{width:'100%',textAlign:'left'}}>{t('auth.askName')}</label>
                        <div style={{display: 'flex', width: '100%', flexDirection:'column'}}>
                            <input type="text" required id={'name'} placeholder={'John D'} value={tempUserName} minLength={3} maxLength={30} onChange={(e) => setTempUserName(e.target.value)}  />
                        </div>
                        {showPasswordCount > 10 &&
                            <div style={{width: '100%'}}>
                                <label htmlFor={'name'} style={{width:'100%',textAlign:'left'}}>{t('auth.secretCode')}</label>
                                <div style={{display: 'flex', width: '100%', flexDirection:'column'}}>
                                    <input type="password" id={'password'} placeholder={'******'} value={tempPassword} minLength={3} maxLength={30} onChange={(e) => setTempPassword(e.target.value)}  />
                                </div>
                            </div>
                        }
                        <label htmlFor={'name'} style={{width:'100%',textAlign:'left'}}>{t('auth.profilePicture')}</label>
                        <div style={{display: 'flex', width: '100%', flexDirection:'column'}}>
                            <ProfilePictureChooser
                                onImageSelect={handleImageSelect}
                                onColorSelect={handleColorSelect}
                                collapsibleSmileys
                            />
                        </div>

                        <button type="submit" className={'btn-push btn-push-green'} style={{width: '100%', padding: '1rem'}}>{t('auth.register')}</button>
                    </form>
                </div>
            </nav>
        </div>
    );
}

export default UserNameInput;

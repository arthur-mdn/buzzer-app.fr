import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaHouse, FaInfo, FaPalette } from 'react-icons/fa6';
import { useUser } from '../../UserContext.jsx';
import { useSocket } from '../../SocketContext.jsx';
import ProfilePictureChooser from '../UserNameInput/ProfilePictureChooser.jsx';
import ProfilePictureViewer from '../UserNameInput/ProfilePictureViewer.jsx';
import Modal from '../modal/Modal.jsx';
import ThemeChooser from '../UserNameInput/ThemeChooser.jsx';
import { useTheme } from '../../ThemeContext.jsx';
import AboutModalContent from './AboutModalContent.jsx';
import { normalizeProfileColor, normalizeProfileImageIndex } from '../../utils/profilePicture.js';

function SettingsView() {
    const { userName, userPictureSmiley, userPictureColor } = useUser();
    const { userBackground, setThemeBackground } = useTheme();
    const socket = useSocket();

    const [tempImageIndex, setTempImageIndex] = useState(() => normalizeProfileImageIndex(userPictureSmiley, false));
    const [tempColor, setTempColor] = useState(() => normalizeProfileColor(userPictureColor));
    const [tempBackground, setTempBackground] = useState(userBackground || 'default');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

    const handleSaveProfile = () => {
        socket.emit('updateUserProfile', {
            userPicture: { smiley: tempImageIndex, color: tempColor },
        });
        setIsProfileModalOpen(false);
    };

    const handleSaveTheme = () => {
        socket.emit('updateUserTheme', {
            userTheme: { background: tempBackground },
        });
        setIsThemeModalOpen(false);
    };

    const handleCancelChanges = () => {
        setIsProfileModalOpen(false);
        setTempImageIndex(normalizeProfileImageIndex(userPictureSmiley, false));
        setTempColor(normalizeProfileColor(userPictureColor));
    };

    const handleCancelThemeChanges = () => {
        setIsThemeModalOpen(false);
        setTempBackground(userBackground || 'default');
        setThemeBackground(userBackground);
    };

    const handleProfileClick = () => {
        setTempImageIndex(normalizeProfileImageIndex(userPictureSmiley, false));
        setTempColor(normalizeProfileColor(userPictureColor));
        setIsProfileModalOpen(true);
    };

    const handleThemeClick = () => {
        setTempBackground(userBackground || 'default');
        setIsThemeModalOpen(true);
    };

    return (
        <>
            <div className="tab-screen profile-view">
                <div className="profile-panel">
                    <h2 className="profile-panel__title">Profil</h2>

                    <div className="profile-panel__card">
                        <button
                            type="button"
                            className="profile-identity"
                            onClick={handleProfileClick}
                        >
                            <span className="profile-identity__avatar">
                                <ProfilePictureViewer
                                    imageIndex={userPictureSmiley}
                                    imageColor={userPictureColor}
                                    size="4.75rem"
                                />
                            </span>
                            <span className="profile-identity__meta">
                                <span className="profile-identity__name">{userName}</span>
                                <span className="profile-identity__hint">Modifier l’avatar et la couleur</span>
                            </span>
                            <FaChevronRight className="profile-identity__chevron" aria-hidden="true" />
                        </button>

                        <div className="profile-actions" role="list">
                            <button
                                type="button"
                                className="profile-actions__item"
                                onClick={handleThemeClick}
                                role="listitem"
                            >
                                <span className="profile-actions__icon" aria-hidden="true">
                                    <FaPalette />
                                </span>
                                <span className="profile-actions__copy">
                                    <span className="profile-actions__label">Thème</span>
                                    <span className="profile-actions__desc">Fond d’écran de l’application</span>
                                </span>
                                <FaChevronRight className="profile-actions__chevron" aria-hidden="true" />
                            </button>

                            <button
                                type="button"
                                className="profile-actions__item"
                                onClick={() => setIsAboutModalOpen(true)}
                                role="listitem"
                            >
                                <span className="profile-actions__icon" aria-hidden="true">
                                    <FaInfo />
                                </span>
                                <span className="profile-actions__copy">
                                    <span className="profile-actions__label">À propos</span>
                                    <span className="profile-actions__desc">Infos, crédits et liens</span>
                                </span>
                                <FaChevronRight className="profile-actions__chevron" aria-hidden="true" />
                            </button>

                            <Link to="/" className="profile-actions__item" role="listitem">
                                <span className="profile-actions__icon" aria-hidden="true">
                                    <FaHouse />
                                </span>
                                <span className="profile-actions__copy">
                                    <span className="profile-actions__label">Page d’accueil</span>
                                    <span className="profile-actions__desc">Présentation de Buzzer App</span>
                                </span>
                                <FaChevronRight className="profile-actions__chevron" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Modal title="Modifier profil" isOpen={isProfileModalOpen} onClose={handleCancelChanges}>
                <div className="modal_content profile-modal">
                    <ProfilePictureChooser
                        onImageSelect={setTempImageIndex}
                        onColorSelect={setTempColor}
                        initialImageIndex={tempImageIndex}
                        initialColor={tempColor}
                    />
                    <button
                        type="button"
                        onClick={handleSaveProfile}
                        className="btn-push btn-push-green profile-modal__save"
                    >
                        Enregistrer
                    </button>
                </div>
            </Modal>

            <Modal title="Modifier thème" isOpen={isThemeModalOpen} onClose={handleCancelThemeChanges}>
                <div className="modal_content profile-modal">
                    <ThemeChooser
                        onBackgroundSelect={setTempBackground}
                        initialBackground={tempBackground}
                    />
                    <button
                        type="button"
                        onClick={handleSaveTheme}
                        className="btn-push btn-push-green profile-modal__save"
                    >
                        Enregistrer
                    </button>
                </div>
            </Modal>

            <Modal title="À propos" isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)}>
                <div className="modal_content about-modal">
                    <AboutModalContent />
                </div>
            </Modal>
        </>
    );
}

export default SettingsView;

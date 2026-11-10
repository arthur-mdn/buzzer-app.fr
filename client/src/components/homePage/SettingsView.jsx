import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaChevronRight, FaHouse, FaInfo, FaLanguage, FaPalette } from 'react-icons/fa6';
import { useUser } from '../../UserContext.jsx';
import { useSocket } from '../../SocketContext.jsx';
import ProfilePictureChooser from '../UserNameInput/ProfilePictureChooser.jsx';
import ProfilePictureViewer from '../UserNameInput/ProfilePictureViewer.jsx';
import Modal from '../modal/Modal.jsx';
import ThemeChooser from '../UserNameInput/ThemeChooser.jsx';
import { useTheme } from '../../ThemeContext.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { localePath } from '../../i18n/seoMeta.js';
import AboutModalContent from './AboutModalContent.jsx';
import { normalizeProfileColor, normalizeProfileImageIndex } from '../../utils/profilePicture.js';

function SettingsView() {
    const { userName, userPictureSmiley, userPictureColor } = useUser();
    const { userBackground, setThemeBackground } = useTheme();
    const { language, setLanguage, languages, t } = useLanguage();
    const socket = useSocket();

    const [tempImageIndex, setTempImageIndex] = useState(() => normalizeProfileImageIndex(userPictureSmiley, false));
    const [tempColor, setTempColor] = useState(() => normalizeProfileColor(userPictureColor));
    const [tempBackground, setTempBackground] = useState(userBackground || 'default');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

    const currentLanguageLabel = languages.find((item) => item.code === language)?.nativeLabel || language;

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

    const handleSelectLanguage = (code) => {
        setLanguage(code);
        setIsLanguageModalOpen(false);
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
                    <h2 className="profile-panel__title">{t('profile.title')}</h2>

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
                                <span className="profile-identity__hint">{t('profile.editAvatar')}</span>
                            </span>
                            <FaChevronRight className="profile-identity__chevron" aria-hidden="true" />
                        </button>

                        <div className="profile-actions">
                            <button
                                type="button"
                                className="profile-actions__item"
                                onClick={handleThemeClick}
                            >
                                <span className="profile-actions__icon" aria-hidden="true">
                                    <FaPalette />
                                </span>
                                <span className="profile-actions__copy">
                                    <span className="profile-actions__label">{t('profile.theme')}</span>
                                    <span className="profile-actions__desc">{t('profile.themeDesc')}</span>
                                </span>
                                <FaChevronRight className="profile-actions__chevron" aria-hidden="true" />
                            </button>

                            <button
                                type="button"
                                className="profile-actions__item"
                                onClick={() => setIsLanguageModalOpen(true)}
                            >
                                <span className="profile-actions__icon" aria-hidden="true">
                                    <FaLanguage />
                                </span>
                                <span className="profile-actions__copy">
                                    <span className="profile-actions__label">{t('profile.language')}</span>
                                    <span className="profile-actions__desc">
                                        {t('profile.languageDesc')} · {currentLanguageLabel}
                                    </span>
                                </span>
                                <FaChevronRight className="profile-actions__chevron" aria-hidden="true" />
                            </button>

                            <button
                                type="button"
                                className="profile-actions__item"
                                onClick={() => setIsAboutModalOpen(true)}
                            >
                                <span className="profile-actions__icon" aria-hidden="true">
                                    <FaInfo />
                                </span>
                                <span className="profile-actions__copy">
                                    <span className="profile-actions__label">{t('profile.about')}</span>
                                    <span className="profile-actions__desc">{t('profile.aboutDesc')}</span>
                                </span>
                                <FaChevronRight className="profile-actions__chevron" aria-hidden="true" />
                            </button>

                            <Link to={localePath(language)} className="profile-actions__item">
                                <span className="profile-actions__icon" aria-hidden="true">
                                    <FaHouse />
                                </span>
                                <span className="profile-actions__copy">
                                    <span className="profile-actions__label">{t('profile.landing')}</span>
                                    <span className="profile-actions__desc">{t('profile.landingDesc')}</span>
                                </span>
                                <FaChevronRight className="profile-actions__chevron" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Modal title={t('profile.editProfile')} isOpen={isProfileModalOpen} onClose={handleCancelChanges}>
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
                        {t('common.save')}
                    </button>
                </div>
            </Modal>

            <Modal title={t('profile.editTheme')} isOpen={isThemeModalOpen} onClose={handleCancelThemeChanges}>
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
                        {t('common.save')}
                    </button>
                </div>
            </Modal>

            <Modal
                title={t('profile.editLanguage')}
                isOpen={isLanguageModalOpen}
                onClose={() => setIsLanguageModalOpen(false)}
            >
                <div className="modal_content profile-modal">
                    <ul className="language-list">
                        {languages.map((item) => {
                            const selected = item.code === language;
                            return (
                                <li key={item.code}>
                                    <button
                                        type="button"
                                        className={`language-list__item${selected ? ' is-selected' : ''}`}
                                        onClick={() => handleSelectLanguage(item.code)}
                                        aria-pressed={selected}
                                    >
                                        <span className="language-list__label">{item.nativeLabel}</span>
                                        {selected ? <FaCheck aria-hidden="true" /> : null}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </Modal>

            <Modal title={t('profile.about')} isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)}>
                <div className="modal_content about-modal">
                    <AboutModalContent />
                </div>
            </Modal>
        </>
    );
}

export default SettingsView;

//SettingsView.jsx
import React, {useState} from "react";
import {useUser} from "../../UserContext.jsx";
import {useSocket} from "../../SocketContext.jsx";
import ProfilePictureChooser from '../UserNameInput/ProfilePictureChooser.jsx';
import ProfilePictureViewer from "../UserNameInput/ProfilePictureViewer.jsx";
import Modal from "../modal/Modal.jsx";
import ThemeChooser from "../UserNameInput/ThemeChooser.jsx";
import {useTheme} from "../../ThemeContext.jsx";
import {FaEdit} from "react-icons/fa";

function SettingsView() {
    const { userRole, userName, userPictureSmiley, userPictureColor } = useUser();
    const { userBackground, setThemeBackground } = useTheme();
    const socket = useSocket();

    const handleDisconnectAll = () => {
        socket.emit('adminForceDisconnect');
    };
    const handleRestPicturesAll = () => {
        socket.emit('adminForceResetProfilPictures');
    };
    const [tempImageIndex, setTempImageIndex] = useState(userPictureSmiley || 1);
    const [tempColor, setTempColor] = useState(userPictureColor || "#999");
    const [tempBackground, setTempBackground] = useState( "default");

    const handleImageSelect = (index) => setTempImageIndex(index);
    const handleBackgroundSelect = (background) => setTempBackground(background);
    const handleColorSelect = (color) => setTempColor(color);

    const handleSaveProfile = () => {
        // Envoyer les nouvelles informations de profil au serveur
        socket.emit('updateUserProfile', { userPicture: { smiley: tempImageIndex, color: tempColor } });
        setIsProfileModalOpen(false);
    };

    const handleSaveTheme = () => {
        // Envoyer les nouvelles informations de profil au serveur
        socket.emit('updateUserTheme', { userTheme: { background: tempBackground } });
        setIsThemeModalOpen(false);
    };

    const handleCancelChanges = () => {
        setIsProfileModalOpen(false)
        setTempImageIndex(userPictureSmiley);
        setTempColor(userPictureColor);
    };
    const handleCancelThemeChanges = () => {
        setIsThemeModalOpen(false);
        setThemeBackground(userBackground);
    };
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

    const handleProfileClick = (event) => {
        setIsProfileModalOpen(true)
        event.stopPropagation(); // Pour éviter la propagation du clic aux éléments parents
    };
    const handleThemeClick = (event) => {
        setIsThemeModalOpen(true)
        event.stopPropagation(); // Pour éviter la propagation du clic aux éléments parents
    };
    return (
        <>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <button className={"btn-push btn-push-gray"} style={{display: "flex", flexDirection: "row", position:"relative", padding:"0.5rem 0.5rem", width:"95%", margin:"2rem 2rem"}}  onClick={handleProfileClick}>
                    <div style={{display: "flex", flexDirection: "row", gap: "0.5rem",width:'100%', alignItems:"center"}}>
                        <ProfilePictureViewer imageIndex={userPictureSmiley} imageColor={userPictureColor}/>
                        <span>{userName}</span>
                        <FaEdit style={{marginLeft:"auto", color:"grey", paddingRight:"10px"}}/>
                    </div>
                </button>
                <button className={"btn-push btn-push-gray"} style={{display: "flex", flexDirection: "row", position:"relative", padding:"0.5rem 0.5rem", width:"95%", margin:"2rem 2rem"}}  onClick={handleThemeClick}>
                    <div style={{display: "flex", flexDirection: "row", gap: "0.5rem",width:'100%'}}>
                        <span>Thème de l'application</span>
                        <FaEdit style={{marginLeft:"auto", color:"grey", paddingRight:"10px"}}/>
                    </div>
                </button>

                {userRole === "admin" &&
                    <div>
                        <h3>YoADMIN</h3>
                        <button onClick={handleDisconnectAll} className={'btn-push btn-push-red'}>
                            Déconnecter tous les utilisateurs
                        </button>
                        <button onClick={handleRestPicturesAll} className={'btn-push btn-push-red'}>
                            Réinitialiser photos de profils
                        </button>
                    </div>
                }
            </div>
            {isProfileModalOpen &&
            <div style={{position:"absolute", width:"100vw", height:"100vh", top:'0', bottom:'0'}}>
                <div style={{position:"relative", width:"100%", height:"100%"}}>
                    <Modal title={"Modifier profil"} isOpen={isProfileModalOpen} onClose={handleCancelChanges} maxHeight={"65vh"} marginBottom={"20vh"} >
                        <form style={{display:"flex", flexDirection:"column",gap:"1rem", alignItems:"center"}} className={"modal_content"}>
                            <div style={{backgroundColor:'red', position:"absolute", top:"0", zIndex:"99999"}}></div>
                            <ProfilePictureChooser
                                onImageSelect={handleImageSelect}
                                onColorSelect={handleColorSelect}
                                initialImageIndex={userPictureSmiley} // Ajout de l'image initiale
                                initialColor={userPictureColor} // Ajout de la couleur initiale
                            />
                            <button type="button" onClick={handleSaveProfile} className={'btn-push btn-push-green'} style={{width:"fit-content", padding:"0.5rem 2rem"}}>
                                Enregistrer
                            </button>
                        </form>
                    </Modal>
                </div>

            </div>
            }
            {isThemeModalOpen &&
            <div style={{position:"absolute", width:"100vw", height:"100vh", top:'0', bottom:'0'}}>
                <div style={{position:"relative", width:"100%", height:"100%"}}>
                    <Modal title={"Modifier thème"} isOpen={isThemeModalOpen} onClose={handleCancelThemeChanges} maxHeight={"65vh"} marginBottom={"20vh"} >
                        <form style={{display:"flex", flexDirection:"column",gap:"1rem", alignItems:"center"}} className={"modal_content"}>
                            <div style={{backgroundColor:'red', position:"absolute", top:"0", zIndex:"99999"}}></div>
                            <ThemeChooser
                                onBackgroundSelect={handleBackgroundSelect}
                                initialBackground={userBackground}
                            />
                            <button type="button" onClick={handleSaveTheme} className={'btn-push btn-push-green'} style={{width:"fit-content", padding:"0.5rem 2rem"}}>
                                Enregistrer
                            </button>
                        </form>
                    </Modal>
                </div>

            </div>
            }

        </>

    );
}

export default SettingsView;

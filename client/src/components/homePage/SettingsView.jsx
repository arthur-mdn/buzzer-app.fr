//SettingsView.jsx
import React, {useState} from "react";
import {useUser} from "../../UserContext.jsx";
import {useSocket} from "../../SocketContext.jsx";
import ProfilePictureChooser from '../UserNameInput/ProfilePictureChooser.jsx';
import ProfilePictureViewer from "../UserNameInput/ProfilePictureViewer.jsx";
import Modal from "../modal/Modal.jsx";
import ThemeChooser from "../UserNameInput/ThemeChooser.jsx";
import {useTheme} from "../../ThemeContext.jsx";
import {FaEdit, FaInfoCircle} from "react-icons/fa";
import AboutApp from "./AboutApp.jsx";
import {FaGithub, FaPaypal} from "react-icons/fa6";

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
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

    const handleProfileClick = (event) => {
        setIsProfileModalOpen(true)
        event.stopPropagation(); // Pour éviter la propagation du clic aux éléments parents
    };
    const handleThemeClick = (event) => {
        setIsThemeModalOpen(true)
        event.stopPropagation(); // Pour éviter la propagation du clic aux éléments parents
    };
    const handleCancelAbout = () => {
        setIsAboutModalOpen(false);
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
                <button className={"btn-push btn-push-gray"} style={{display: "flex", flexDirection: "row", position:"relative", padding:"0.5rem 0.5rem", width:"95%", margin:"2rem 2rem"}}  onClick={() => setIsAboutModalOpen(true)}>
                    <div style={{display: "flex", flexDirection: "row", gap: "0.5rem",width:'100%'}}>
                        <span>À propos</span>
                        <FaInfoCircle style={{marginLeft:"auto", color:"grey", paddingRight:"10px"}}/>
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
            {isAboutModalOpen &&
            <div style={{position:"absolute", width:"100vw", height:"100vh", top:'0', bottom:'0'}}>
                <div style={{position:"relative", width:"100%", height:"100%"}}>
                    <Modal title={"À Propos"} isOpen={isAboutModalOpen} onClose={handleCancelAbout} maxHeight={"65vh"} marginBottom={"20vh"} >
                        <form style={{display:"flex", flexDirection:"column",gap:"1rem", alignItems:"center"}} className={"modal_content"}>
                            <div style={{textAlign: "justify", padding: '1rem', overflowY: "scroll"}}>
                                <div>
                                    "Buzzer-App" révolutionne les soirées jeux avec une expérience interactive et
                                    dynamique, transformant chaque rencontre en une compétition palpitante de rapidité
                                    et d'esprit.
                                    <br/>
                                    <br/>
                                    Cette application web innovante est conçue pour animer vos soirées blind-test, quizz
                                    et bien d'autres jeux de groupe, en introduisant un élément compétitif captivant :
                                    qui appuiera sur le buzzer en premier ?
                                    <br/>
                                    <br/>
                                    Avec "Buzzer-App", l'hôte crée facilement un groupe et invite les participants via
                                    un code ou un lien d’invitation.
                                    <br/>
                                    <br/>
                                    Chaque joueur, muni de son buzzer virtuel, est prêt à relever le défi dès que l'hôte
                                    lance la partie.
                                    <br/>
                                    <br/>
                                    Les points en jeu, définis par l'hôte, ajoutent une couche stratégique à chaque
                                    question.
                                    <br/>
                                    <br/>
                                    L'application affiche en temps réel le nom du joueur le plus rapide, tandis que
                                    l'hôte garde le contrôle pour valider ou refuser les réponses.
                                    <br/>
                                    <br/>
                                    "Buzzer-App" ne se contente pas de mesurer la rapidité ; elle offre aussi un aperçu
                                    de la connexion réseau de chaque participant, garantissant ainsi une compétition
                                    équitable.
                                    <br/>
                                    <br/>
                                    Rejoignez la communauté "Buzzer-App" pour transformer vos rencontres en moments
                                    inoubliables d'amusement et de compétition.
                                    <br/>
                                    <br/>
                                    Crédits : Arthur Mondon, 2023 <a href={"https://mondon.pro/projet/buzzer-app"}
                                                                     target={"_blank"}>Voir le projet</a>
                                    <br/>
                                    <br/>
                                    <div style={{display: "flex", gap: '1rem'}}>
                                        <a className={"btn-push"} style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: '0.5rem'
                                        }} href={"https://github.com/arthur-mdn/buzzer-app"} target={"_blank"}>
                                            <FaGithub/>
                                            GitHub
                                        </a>
                                        <a className={"btn-push btn-push-green"} style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: '0.5rem'
                                        }} href={"https://www.paypal.com/paypalme/arthurmondon"} target={"_blank"}>
                                            <FaPaypal/>
                                            PayPal
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Modal>
                </div>

            </div>
            }

        </>

    );
}

export default SettingsView;

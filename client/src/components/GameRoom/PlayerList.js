// PlayerList.js
import React, {useEffect, useState} from 'react';
import {FaCircle, FaEllipsisV} from 'react-icons/fa';
import {useUser} from "../../UserContext";
import {useGame} from "../../GameContext";
import {useSocket} from "../../SocketContext";
import ProfilePictureViewer from "../UserNameInput/ProfilePictureViewer";
import config from "../../config";
import {useParams} from "react-router-dom";
import {useToken} from "../../TokenContext";
import Modal from "../modal/Modal";
import PlayerItem from "./PlayerItem";

function PlayerList({ serverInfo }) {
    const socket = useSocket();
    const { userId } = useUser();
    const { players } = useGame();
    const { serverCode } = useParams();
    const token = useToken();
    const [showPlayerDetails, setShowPlayerDetails] = useState(false);
    const [playerDetails, setPlayerDetails] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);

    const handleMenuToggle = (playerId) => {
        if (openMenuId === playerId) {
            setOpenMenuId(null);
        } else {
            setOpenMenuId(playerId);
        }
    };

    const playersGrouped = players ? players.reduce((acc, player) => {
        const key = `${player.role}-${player.state}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(player);
        return acc;
    }, {}) : {};




    const PlayerDetailsPopup = ({ details }) => {
        if (!details) return null;
        return (
            <Modal isOpen={showPlayerDetails} title={"Détails du joueur"} onClose={() => setShowPlayerDetails(false)} >
                <div className={"modal_content"}>
                    <ProfilePictureViewer imageIndex={ details.userPicture.smiley} imageColor={ details.userPicture.color}/>
                    <h2>{details.userName}</h2>
                    <h2>{details.creation}</h2>
                    <h2>{details.userRole}</h2>
                </div>
            </Modal>
        );
    };

    const handleShowPlayerDetails = async (playerId) => {
        try {
            const response = await fetch(config.serverUrl + `/user-profile/${playerId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setPlayerDetails(data.user);
                setShowPlayerDetails(true);
            } else {
                alert("profil introuvable")
            }

        } catch (error) {
            console.error('There was an error fetching the server details:', error);
            console.log('Erreur lors de la récupération des détails du serveur. Veuillez réessayer.');
        }
    };

    return (
        <>
            <div className={"tab-content"} style={{height:'100%', overflowY:'scroll'}}>
                <div style={{display:'flex', flexDirection:"column",gap:"0.5rem"}}>
                    <h2 style={{margin:'0'}}>Hôte:</h2>
                    <ul className={playersGrouped['host-online']?.some(player => player.user.userId === userId) ? "yourProfile" : ""}>
                        {playersGrouped['host-online']?.map(player => <PlayerItem serverInfo={serverInfo} key={player.user._id} player={player}  onMenuToggle={handleMenuToggle} isOpen={openMenuId === player.user._id}  onShowDetails={() => handleShowPlayerDetails(player.user.userId)}  />)}
                    </ul>
                    <ul className={playersGrouped['host-offline']?.some(player => player.user.userId === userId) ? "yourProfile" : ""}>
                        {playersGrouped['host-offline']?.map(player => <PlayerItem serverInfo={serverInfo} key={player.user._id} player={player}  onMenuToggle={handleMenuToggle} isOpen={openMenuId === player.user._id}  onShowDetails={() => handleShowPlayerDetails(player.user.userId)}  />)}
                    </ul>
                    <h2 style={{margin:'0'}}>Joueurs:</h2>
                    <ul className={playersGrouped['user-online']?.some(player => player.user.userId === userId) ? "yourProfile" : ""}>
                        {playersGrouped['user-online']?.map(player => <PlayerItem serverInfo={serverInfo} key={player.user._id} player={player}  onMenuToggle={handleMenuToggle} isOpen={openMenuId === player.user._id}  onShowDetails={() => handleShowPlayerDetails(player.user.userId)}  />)}
                    </ul>
                    <ul className={playersGrouped['user-offline']?.some(player => player.user.userId === userId) ? "yourProfile" : ""}>
                        {playersGrouped['user-offline']?.map(player => <PlayerItem serverInfo={serverInfo} key={player.user.userId} player={player}  onMenuToggle={handleMenuToggle} isOpen={openMenuId === player.user._id}  onShowDetails={() => handleShowPlayerDetails(player.user.userId)}  />)}
                    </ul>
                </div>
            </div>
            {showPlayerDetails && <PlayerDetailsPopup details={playerDetails} />}

        </>

    );
}


export default PlayerList;

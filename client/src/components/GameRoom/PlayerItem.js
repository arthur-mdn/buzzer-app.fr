import React, {useEffect, useState} from 'react';
import ProfilePictureViewer from "../UserNameInput/ProfilePictureViewer";
import {useSocket} from "../../SocketContext";
import {useUser} from "../../UserContext";

function PlayerItem({ player, onShowDetails, serverInfo, onKickPlayer, onMenuToggle, isOpen }) {
    const socket = useSocket();
    const { userId } = useUser();

    const handleKickPlayer = () => {
        // Envoyer un événement de socket pour expulser le joueur
        socket.emit('kickPlayer', { serverCode: serverInfo.code, playerId: player.user.userId });
    };
    const handlePlayerProfile = async (event) => {
        event.stopPropagation(); // Empêche la propagation de l'événement au parent
        onMenuToggle(null);
        onShowDetails(player.user.userId);
    };

    const handlePlayerItemClick = (event) => {
        onMenuToggle(player.user._id);
        event.stopPropagation();
    };

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!event.target.closest('.player-dropdown')) {
                onMenuToggle(null);
            }
        };

        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, []);

    return (
        <>

            <li className={"btn-push btn-push-gray"} style={{display: "flex", flexDirection: "row", position:"relative", padding:"0.5rem 0.5rem"}}  onClick={handlePlayerItemClick}>
                <div style={{display: "flex", flexDirection: "row", gap: "0.5rem",width:'100%'}}>
                    <div>
                        <ProfilePictureViewer imageIndex={ player.user.userPicture.smiley} imageColor={ player.user.userPicture.color}/>
                    </div>
                    <div style={{display:"flex", flexDirection:"column", gap:"0.2rem"}}>
                        <span>{player.user.userName}</span>
                        <span className={player.state} >
                                {player.state === 'online' ? 'En ligne' : 'Hors ligne'}
                            </span>
                    </div>
                    {(player.role !== 'host') &&
                        <div style={{marginLeft: 'auto', display: "flex"}}>
                            <div
                                style={{marginLeft: 'auto', display: 'flex', alignItems: "center", padding: '0 0.5rem 0 0'}}
                                title={player.wins + ' victoires'}>
                                <span style={{marginLeft: 'auto'}}>{player.score} / {serverInfo.options.winPoint} </span>
                            </div>
                            <div style={{
                                backgroundColor: '#acadaf',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: "center",
                                padding: '0 0.5rem 0 0',
                                fontFamily:"Fredoka One",
                                textShadow: "2px 1px 2px black",
                            }} title={player.wins + ' victoires'}>
                                <img src={process.env.PUBLIC_URL + '/trophee.png'} alt="trophée" style={{width: '40px'}}/>
                                <span style={{color: "white"}}>
                                        {player.wins}
                                    </span>
                            </div>
                        </div>
                    }
                </div>
                {/*<button  className="player-menu-button" onClick={() => handleMenuToggle(player.user._id)}><FaEllipsisV /></button>*/}
                {isOpen && (
                    <div>

                        <div className={"player_dropdown"}>
                            <ul style={{listStyle: "none", alignItems:'center'}}>
                                <li  onClick={handlePlayerProfile} >
                                    <button type={"button"} className={"btn-push btn-push-green"}>Afficher le profil</button>
                                </li>
                                {(serverInfo.hostId === userId && userId !== player.user.userId) && (
                                    <li onClick={handleKickPlayer}>
                                        <button type={"button"} className={"btn-push"}>Kick</button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                )}
            </li>
        </>
    )
}

export default PlayerItem;

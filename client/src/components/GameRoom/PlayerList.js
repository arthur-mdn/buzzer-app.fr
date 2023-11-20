// PlayerList.js
import React, {useEffect, useState} from 'react';
import {FaCircle, FaEllipsisV} from 'react-icons/fa';
import {useUser} from "../../UserContext";
import {useGame} from "../../GameContext";
import {useSocket} from "../../SocketContext";
import ProfilePictureViewer from "../UserNameInput/ProfilePictureViewer";

function PlayerList({ serverInfo }) {
    const socket = useSocket();
    const { userId } = useUser();
    const { players } = useGame();

    const playersGrouped = players ? players.reduce((acc, player) => {
        const key = `${player.role}-${player.state}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(player);
        return acc;
    }, {}) : {};


    const [openMenuId, setOpenMenuId] = useState(null);

    const handleMenuToggle = (playerId) => {
        if (openMenuId === playerId) {
            setOpenMenuId(null); // Fermer le menu si c'est le même joueur
        } else {
            setOpenMenuId(playerId); // Ouvrir le nouveau menu
        }
    };


    const handleOutsideClick = (e) => {
        if (!e.target.closest('.player-menu-button')) {
            setOpenMenuId(null); // Fermer tous les menus si le clic est en dehors
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, []);

    const PlayerItem = ({ player }) => {
        const isMenuOpen = openMenuId === player.user._id;

        const handleKickPlayer = (playerId) => {
            console.log(player.user.userId)
            // Envoyer un événement de socket pour expulser le joueur
            socket.emit('kickPlayer', { serverCode: serverInfo.code, playerId: player.user.userId });
        };
        const handlePlayerItemClick = (event) => {
            handleMenuToggle(player.user._id);
            event.stopPropagation(); // Pour éviter la propagation du clic aux éléments parents
        };


        return (
    <>
    {isMenuOpen && (
        <div style={{position:"absolute", width:'100%', height:'100%', left:"0",top:'0', zIndex:"1",backgroundColor:'rgba(0,0,0,0.4)'}}>

        </div>
    )
    }
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
        {isMenuOpen && (
            <div>

                <div className={"player_dropdown"}>
                    <ul style={{listStyle: "none", alignItems:'center'}}>
                        <li onClick={() => {/* Logique pour afficher le profil du joueur */}}>
                            <button className={"btn-push btn-push-green"}>Afficher le profil</button>
                        </li>
                        {(serverInfo.hostId === userId && userId !== player.user.userId) && (
                            <li onClick={handleKickPlayer}>
                                <button className={"btn-push"}>Kick</button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

        )}
    </li>
    </>
    )

    };

    return (
        <div className={"tab-content"} style={{height:'100%', overflowY:'scroll'}}>
            <div style={{display:'flex', flexDirection:"column",gap:"0.5rem"}}>
                <h2 style={{margin:'0'}}>Hôte:</h2>
                <ul className={playersGrouped['host-online']?.some(player => player.user.userId === userId) ? "yourProfile" : ""}>
                    {playersGrouped['host-online']?.map(player => <PlayerItem key={player.user._id} player={player} />)}
                </ul>
                <ul className={playersGrouped['host-offline']?.some(player => player.user.userId === userId) ? "yourProfile" : ""}>
                    {playersGrouped['host-offline']?.map(player => <PlayerItem key={player.user._id} player={player} />)}
                </ul>
                <h2 style={{margin:'0'}}>Joueurs:</h2>
                <ul className={playersGrouped['user-online']?.some(player => player.user.userId === userId) ? "yourProfile" : ""}>
                    {playersGrouped['user-online']?.map(player => <PlayerItem key={player.user._id} player={player} />)}
                </ul>
                <ul className={playersGrouped['user-offline']?.some(player => player.user.userId === userId) ? "yourProfile" : ""}>
                    {playersGrouped['user-offline']?.map(player => <PlayerItem key={player.user.userId} player={player} />)}
                </ul>
            </div>
        </div>
    );
}


export default PlayerList;

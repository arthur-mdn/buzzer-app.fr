// PlayerList.js
import React from 'react';
import { FaCircle } from 'react-icons/fa';
import {useUser} from "../../UserContext";
import {useGame} from "../../GameContext";

function PlayerList({ serverInfo }) {
    const { userId } = useUser();
    const { players } = useGame();

    const playersGrouped = players ? players.reduce((acc, player) => {
        const key = `${player.role}-${player.state}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(player);
        return acc;
    }, {}) : {};

    const PlayerItem = ({ player }) => (
        <li style={{display:"flex", flexDirection: "column"}}>
            <div style={{display:"flex", flexDirection:"row", gap: "0.5rem", }}>
                <div>
                    <img src={process.env.PUBLIC_URL + '/user.png'} alt="Logo" style={{ width: '40px' }}/>
                </div>
                <div>
                    <span>{player.user.userName}</span>
                    <span className={player.state}>
                        <FaCircle /> {player.state === 'online' ? 'En ligne' : 'Hors ligne'}
                    </span>
                </div>
                {(player.role !== 'host' ) &&
                    <div style={{marginLeft:'auto',display:"flex"}}>
                            <div style={{marginLeft:'auto', display:'flex', alignItems:"center", padding:'0 0.5rem 0 0'}} title={player.wins + ' victoires'}>
                                <span style={{marginLeft:'auto'}}>{player.score} / {serverInfo.options.winPoint} </span>
                            </div>
                        <div style={{ backgroundColor:'#8d9eb8', borderRadius:'0.5rem', display:'flex', alignItems:"center", padding:'0 0.5rem 0 0'}} title={player.wins + ' victoires'}>
                            <img src={process.env.PUBLIC_URL + '/trophee.png'} alt="trophée" style={{ width: '40px' }}/>
                            <span style={{color:"white"}}>
                            {player.wins}
                        </span>
                        </div>
                    </div>
                }
            </div>
        </li>
    );

    return (
        <div className={"tab-content"} style={{height:'100%', overflowY:'scroll'}}>
            <div>
                <h2 style={{marginTop:'0'}}>Hôte:</h2>
                <ul className={playersGrouped['host-online']?.some(player => player.user.userId === userId) ? "yourProfile" : ""}>
                    {playersGrouped['host-online']?.map(player => <PlayerItem key={player._id} player={player} />)}
                </ul>
                <ul className={playersGrouped['host-offline']?.some(player => player.user.userId === userId) ? "yourProfile" : ""}>
                    {playersGrouped['host-offline']?.map(player => <PlayerItem key={player._id} player={player} />)}
                </ul>
                <h2>Joueurs:</h2>
                <ul className={playersGrouped['user-online']?.some(player => player.user.userId === userId) ? "yourProfile" : ""}>
                    {playersGrouped['user-online']?.map(player => <PlayerItem key={player._id} player={player} />)}
                </ul>
                <ul className={playersGrouped['user-offline']?.some(player => player.user.userId === userId) ? "yourProfile" : ""}>
                    {playersGrouped['user-offline']?.map(player => <PlayerItem key={player.user.userId} player={player} />)}
                </ul>
            </div>
        </div>
    );
}


export default PlayerList;

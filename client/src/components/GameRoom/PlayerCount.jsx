// PlayerCount.jsx
import React from 'react';
import {useGame} from "../../GameContext.jsx";

function PlayerCount() {

    const {players} = useGame();

    const playersGrouped = players ? players.reduce((acc, player) => {
        const key = `${player.role}-${player.state}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(player);
        return acc;
    }, {}) : {};

    const onlineHosts = playersGrouped['host-online'] ? playersGrouped['host-online'].length : 0;
    const onlineUsers = playersGrouped['user-online'] ? playersGrouped['user-online'].length : 0;

    return (
        <div>
            {onlineHosts + onlineUsers}
        </div>
    );
}


export default PlayerCount;

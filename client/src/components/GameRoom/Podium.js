// Podium.js
import React from 'react';

function Podium({ players }) {
    const filteredPlayers = players
        .filter(player => player.role !== 'host' && player.score > 0)
        .sort((a, b) => b.score - a.score);
    const topThreePlayers = filteredPlayers.slice(0, 3);
    console.log(players)
    return (
        <div>

            {topThreePlayers.map((player, index) => (
                <div key={player.user._id}>
                    <span>{index + 1}. </span>
                    <span>{player.user.userName} - </span>
                    <span>{player.score} points</span>
                </div>
            ))}
        </div>
    );
}

export default Podium;

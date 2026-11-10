// Podium.jsx
import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

function Podium({ players }) {
    const { t } = useLanguage();
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
                    <span>{t('game.points', { count: player.score })}</span>
                </div>
            ))}
        </div>
    );
}

export default Podium;

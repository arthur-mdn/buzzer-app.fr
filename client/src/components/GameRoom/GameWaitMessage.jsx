function GameWaitMessage({ title, subtitle, fullScreen = false }) {
    return (
        <div className={`game-wait${fullScreen ? ' game-wait--fullscreen' : ''}`}>
            <div className="game-wait__card">
                <p className="game-wait__title">{title}</p>
                {subtitle && <p className="game-wait__subtitle">{subtitle}</p>}
            </div>
        </div>
    );
}

export default GameWaitMessage;

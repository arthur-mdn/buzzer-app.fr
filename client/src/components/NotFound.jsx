import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="game-wait game-wait--fullscreen">
            <div className="game-wait__card">
                <p className="game-wait__title">Vous vous êtes perdu ?</p>
                <p className="game-wait__subtitle">Cette page n&apos;existe pas.</p>
                <Link to="/" className="btn-push btn-push-green" style={{ padding: '0.75rem 1.5rem', marginTop: '0.5rem' }}>
                    Accueil
                </Link>
            </div>
        </div>
    );
}

export default NotFound;

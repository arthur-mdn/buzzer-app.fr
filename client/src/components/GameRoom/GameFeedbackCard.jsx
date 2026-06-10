import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../../GameContext.jsx';

const FEEDBACK_LABELS = {
    correct: 'Bonne réponse !',
    wrong: 'Mauvaise réponse',
};

function GameFeedbackCard() {
    const { animationType, setAnimationType, message } = useGame();

    useEffect(() => {
        if (animationType === 'none') return undefined;

        const timer = setTimeout(() => setAnimationType('none'), 1400);
        return () => clearTimeout(timer);
    }, [animationType, setAnimationType]);

    if (animationType !== 'correct' && animationType !== 'wrong') {
        return null;
    }

    return createPortal(
        <div className="game-feedback" aria-live="polite">
            <div className={`game-feedback__card game-feedback__card--${animationType}`}>
                <p className="game-feedback__title">{message || FEEDBACK_LABELS[animationType]}</p>
            </div>
        </div>,
        document.body
    );
}

export default GameFeedbackCard;

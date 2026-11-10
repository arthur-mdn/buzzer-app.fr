import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../../GameContext.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const FEEDBACK_KEYS = {
    correct: 'game.feedbackCorrect',
    wrong: 'game.feedbackWrong',
};

function GameFeedbackCard() {
    const { animationType, setAnimationType, message } = useGame();
    const { t } = useLanguage();

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
                <p className="game-feedback__title">{message || t(FEEDBACK_KEYS[animationType])}</p>
            </div>
        </div>,
        document.body
    );
}

export default GameFeedbackCard;

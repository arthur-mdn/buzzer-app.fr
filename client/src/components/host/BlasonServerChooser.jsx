import { useEffect, useState } from 'react';
import { FaPen } from 'react-icons/fa6';

const TOTAL_BLASONS = 6;

function BlasonServerChooser({ onImageSelect, initialImageIndex = 1 }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(initialImageIndex);
    const [showGrid, setShowGrid] = useState(false);

    useEffect(() => {
        if (initialImageIndex != null) {
            setSelectedImageIndex(initialImageIndex);
        }
    }, [initialImageIndex]);

    const handleSelect = (imageNumber) => {
        setSelectedImageIndex(imageNumber);
        setShowGrid(false);
        onImageSelect?.(imageNumber);
    };

    return (
        <div className="avatar-picker avatar-picker--blason">
            <button
                type="button"
                className="avatar-picker__preview-btn"
                onClick={() => setShowGrid((open) => !open)}
                aria-expanded={showGrid}
                aria-label={showGrid ? 'Fermer le choix de blason' : 'Modifier le blason'}
            >
                <div className="avatar-picker__preview">
                    <div className="avatar-picker__preview-inner">
                        <img
                            src={`/blasons/blason${selectedImageIndex}.png`}
                            alt=""
                            className="avatar-picker__preview-img"
                        />
                    </div>
                </div>
                <span className="avatar-picker__edit-badge" aria-hidden="true">
                    <FaPen />
                </span>
            </button>

            {showGrid && (
                <div className="avatar-picker__grid avatar-picker__grid--compact" role="listbox" aria-label="Blasons disponibles">
                    {Array.from({ length: TOTAL_BLASONS }, (_, i) => i + 1).map((number) => {
                        const isSelected = number === selectedImageIndex;
                        return (
                            <button
                                key={number}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                aria-label={`Blason ${number}`}
                                className={`avatar-picker__option${isSelected ? ' avatar-picker__option--selected' : ''}`}
                                onClick={() => handleSelect(number)}
                            >
                                <img
                                    src={`/blasons/blason${number}.png`}
                                    alt=""
                                    draggable={false}
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default BlasonServerChooser;

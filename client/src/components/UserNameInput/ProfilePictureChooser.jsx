import { useEffect, useState } from 'react';
import { FaPen } from 'react-icons/fa6';
import {
    PROFILE_COLORS,
    DEFAULT_PROFILE_COLOR,
    TOTAL_PROFILE_SMILEYS,
    normalizeProfileImageIndex,
    normalizeProfileColor,
    fetchColoredProfileSvg,
} from '../../utils/profilePicture.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

function ProfilePictureChooser({
    onImageSelect,
    onColorSelect,
    initialImageIndex,
    initialColor,
    collapsibleSmileys = false,
}) {
    const { t } = useLanguage();
    const [selectedImageIndex, setSelectedImageIndex] = useState(() =>
        normalizeProfileImageIndex(initialImageIndex, initialImageIndex == null)
    );
    const [selectedColor, setSelectedColor] = useState(() =>
        normalizeProfileColor(initialColor ?? DEFAULT_PROFILE_COLOR)
    );
    const [selectedImage, setSelectedImage] = useState(null);
    const [showSmileyGrid, setShowSmileyGrid] = useState(false);

    useEffect(() => {
        if (initialImageIndex != null) {
            setSelectedImageIndex(normalizeProfileImageIndex(initialImageIndex, false));
        }
        if (initialColor != null) {
            setSelectedColor(normalizeProfileColor(initialColor));
        }
    }, [initialImageIndex, initialColor]);

    useEffect(() => {
        onImageSelect?.(selectedImageIndex);
        onColorSelect?.(selectedColor);
    }, [selectedImageIndex, selectedColor]);

    useEffect(() => {
        let cancelled = false;

        fetchColoredProfileSvg(selectedImageIndex, selectedColor)
            .then((svg) => {
                if (!cancelled) {
                    setSelectedImage(svg);
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    console.error('Error fetching SVG:', error);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [selectedImageIndex, selectedColor]);

    const handleColorSelect = (color) => {
        setSelectedColor(normalizeProfileColor(color));
    };

    const handleImageSelect = (imageNumber) => {
        setSelectedImageIndex(normalizeProfileImageIndex(imageNumber, false));
        if (collapsibleSmileys) {
            setShowSmileyGrid(false);
        }
    };

    const smileyGrid = (
        <div
            className={`avatar-picker__grid${collapsibleSmileys ? ' avatar-picker__grid--full' : ''}`}
            role="listbox"
            aria-label={t('avatar.smileys')}
        >
            {Array.from({ length: TOTAL_PROFILE_SMILEYS }, (_, i) => i + 1).map((number) => {
                const isSelected = number === selectedImageIndex;
                return (
                    <button
                        key={number}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        aria-label={t('avatar.smiley', { number })}
                        className={`avatar-picker__option${isSelected ? ' avatar-picker__option--selected' : ''}`}
                        onClick={() => handleImageSelect(number)}
                    >
                        <img
                            src={`/smileys/smiley_${number}.svg`}
                            alt=""
                            draggable={false}
                        />
                    </button>
                );
            })}
        </div>
    );

    return (
        <div className={`avatar-picker avatar-picker--profile${collapsibleSmileys ? ' avatar-picker--compact' : ''}`}>
            {collapsibleSmileys ? (
                <>
                    <button
                        type="button"
                        className="avatar-picker__preview-btn"
                        onClick={() => setShowSmileyGrid((open) => !open)}
                        aria-expanded={showSmileyGrid}
                        aria-label={showSmileyGrid ? t('avatar.closeSmileyPicker') : t('avatar.editSmiley')}
                    >
                        <div className="avatar-picker__preview">
                            <div
                                className="avatar-picker__preview-inner"
                                dangerouslySetInnerHTML={{ __html: selectedImage }}
                            />
                        </div>
                        <span className="avatar-picker__edit-badge" aria-hidden="true">
                            <FaPen />
                        </span>
                    </button>

                    {showSmileyGrid && smileyGrid}
                </>
            ) : (
                <>
                    <p className="avatar-picker__section-title">{t('avatar.preview')}</p>
                    <div className="avatar-picker__preview">
                        <div
                            className="avatar-picker__preview-inner"
                            dangerouslySetInnerHTML={{ __html: selectedImage }}
                        />
                    </div>

                    <p className="avatar-picker__section-title">{t('avatar.smileyTitle')}</p>
                    {smileyGrid}
                </>
            )}

            <p className="avatar-picker__section-title">{t('avatar.colorTitle')}</p>
            <div className="avatar-picker__colors" role="listbox" aria-label={t('avatar.colors')}>
                {PROFILE_COLORS.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                        <button
                            key={color}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            aria-label={t('avatar.color', { color })}
                            className={`avatar-picker__color${isSelected ? ' avatar-picker__color--selected' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorSelect(color)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default ProfilePictureChooser;

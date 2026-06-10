import { useEffect, useState } from 'react';
import {
    PROFILE_COLORS,
    DEFAULT_PROFILE_COLOR,
    TOTAL_PROFILE_SMILEYS,
    normalizeProfileImageIndex,
    normalizeProfileColor,
    fetchColoredProfileSvg,
} from '../../utils/profilePicture.js';

function ProfilePictureChooser({ onImageSelect, onColorSelect, initialImageIndex, initialColor }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(() =>
        normalizeProfileImageIndex(initialImageIndex, initialImageIndex == null)
    );
    const [selectedColor, setSelectedColor] = useState(() =>
        normalizeProfileColor(initialColor ?? DEFAULT_PROFILE_COLOR)
    );
    const [selectedImage, setSelectedImage] = useState(null);

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
    };

    return (
        <div className="avatar-picker avatar-picker--profile">
            <p className="avatar-picker__section-title">Aperçu</p>
            <div className="avatar-picker__preview">
                <div
                    className="avatar-picker__preview-inner"
                    dangerouslySetInnerHTML={{ __html: selectedImage }}
                />
            </div>

            <p className="avatar-picker__section-title">Couleur</p>
            <div className="avatar-picker__colors" role="listbox" aria-label="Couleurs du profil">
                {PROFILE_COLORS.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                        <button
                            key={color}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            aria-label={`Couleur ${color}`}
                            className={`avatar-picker__color${isSelected ? ' avatar-picker__color--selected' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorSelect(color)}
                        />
                    );
                })}
            </div>

            <p className="avatar-picker__section-title">Smiley</p>
            <p className="avatar-picker__hint">Fais défiler pour voir tous les avatars</p>
            <div className="avatar-picker__grid" role="listbox" aria-label="Smileys disponibles">
                {Array.from({ length: TOTAL_PROFILE_SMILEYS }, (_, i) => i + 1).map((number) => {
                    const isSelected = number === selectedImageIndex;
                    return (
                        <button
                            key={number}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            aria-label={`Smiley ${number}`}
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
        </div>
    );
}

export default ProfilePictureChooser;

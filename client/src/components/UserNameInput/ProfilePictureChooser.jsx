import React, { useState, useEffect } from 'react';
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
    const [showAllImages, setShowAllImages] = useState(false);

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

    const handleNewImageSelect = (imageNumber) => {
        setSelectedImageIndex(normalizeProfileImageIndex(imageNumber, false));
        setShowAllImages(false);
    };

    return (
        <div className="profile-picture-chooser">
            <div
                dangerouslySetInnerHTML={{ __html: selectedImage }}
                onClick={() => setShowAllImages((open) => !open)}
                className="image-container editable"
                style={{ width: '120px', height: '120px', position: 'relative' }}
            />
            <div>
                {PROFILE_COLORS.map((color) => (
                    <button
                        type="button"
                        key={color}
                        style={{
                            backgroundColor: color,
                            border: selectedColor === color ? '2px solid black' : '0',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            margin: '5px',
                            cursor: 'pointer',
                        }}
                        onClick={() => handleColorSelect(color)}
                    />
                ))}
            </div>
            {showAllImages && (
                <div className="profile-picture-grid">
                    {Array.from({ length: TOTAL_PROFILE_SMILEYS }, (_, i) => i + 1).map((number) => (
                        <img
                            key={number}
                            src={`/smileys/smiley_${number}.svg`}
                            alt={`Smiley ${number}`}
                            onClick={() => handleNewImageSelect(number)}
                            style={number === selectedImageIndex ? { border: '2px solid blue' } : null}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProfilePictureChooser;

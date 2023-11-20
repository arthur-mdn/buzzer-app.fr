//ProfilePictureChooser.js
import React, { useState, useEffect } from 'react';

function ProfilePictureChooser({ onImageSelect, onColorSelect , initialImageIndex, initialColor }) {
    const totalSmileys = 30;
    const [selectedImage, setSelectedImage] = useState(null);
    const [showAllImages, setShowAllImages] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [selectedColor, setSelectedColor] = useState('#999'); // Utiliser #999 comme couleur par défaut

    const handleColorSelect = (color) => {
        setSelectedColor(color);
        if (onColorSelect) {
            onColorSelect(color); // Appeler le callback avec la couleur sélectionnée
        }
    };

    const handleNewImageSelect = (imageNumber) => {
        fetchAndModifySvg(imageNumber, selectedColor);
        setSelectedImageIndex(imageNumber);
        setShowAllImages(false);
        if (onImageSelect) {
            onImageSelect(imageNumber); // Appeler le callback avec l'index de l'image sélectionnée
        }
    };

    const handleImageClick = () => {
        setShowAllImages(!showAllImages);
    };

    useEffect(() => {
        const randomImageNumber = Math.floor(Math.random() * totalSmileys) + 1;
        fetchAndModifySvg(randomImageNumber, selectedColor);
        setSelectedImageIndex(randomImageNumber);
    }, []);

    useEffect(() => {
        if (initialImageIndex != null) {
            // Utiliser l'index et la couleur initiaux si fournis
            setSelectedImageIndex(initialImageIndex);
            setSelectedColor(initialColor);
            fetchAndModifySvg(initialImageIndex, initialColor);
        } else {
            // Sélectionnez une image aléatoire si aucun index initial n'est fourni
            const randomImageNumber = Math.floor(Math.random() * totalSmileys) + 1;
            fetchAndModifySvg(randomImageNumber, selectedColor);
            setSelectedImageIndex(randomImageNumber);
        }
    }, [initialImageIndex, initialColor]);

    useEffect(() => {
        if (selectedImageIndex != null) {
            fetchAndModifySvg(selectedImageIndex, selectedColor);
        }
    }, [selectedColor, selectedImageIndex]);

    const fetchAndModifySvg = async (imageNumber, color) => {
        try {
            const response = await fetch(`/smileys/smiley_${imageNumber}.svg`);
            let svgText = await response.text();
            svgText = svgText.replace(/(\.cls-1\s*\{\s*fill\s*:)[^;}]*(;?\s*\})/, `$1 ${color}$2`);
            setSelectedImage(svgText);
        } catch (error) {
            console.error('Error fetching SVG:', error);
        }
    };

    return (
        <div className="profile-picture-chooser">
            <div dangerouslySetInnerHTML={{ __html: selectedImage }} onClick={handleImageClick} className={"image-container"} style={{width:"120px", height:"120px"}}/>
            <div>
                {['#FF5B37', '#0AA3BB', '#94C114', '#F8CF1D', '#745BB7', '#0CBA8C', '#999'].map(color => (
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
                            cursor: "pointer"
                        }}
                        onClick={() => handleColorSelect(color)}
                    />
                ))}
            </div>
            {showAllImages && (
                <div className="profile-picture-grid">
                    {Array.from({ length: totalSmileys }, (_, i) => i + 1).map((number) => (
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

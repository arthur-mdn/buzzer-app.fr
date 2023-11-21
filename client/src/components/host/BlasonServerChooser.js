//BlasonServerChooser.js
import React, { useState, useEffect } from 'react';

function BlasonServerChooser({ onImageSelect, initialImageIndex }) {
    const totalBlasons = 6;
    const [showAllImages, setShowAllImages] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    const handleNewImageSelect = (imageNumber) => {
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
        const randomImageNumber = Math.floor(Math.random() * totalBlasons) + 1;
        setSelectedImageIndex(randomImageNumber);
    }, []);

    useEffect(() => {
        if (initialImageIndex != null) {
            setSelectedImageIndex(initialImageIndex);
        } else {
            // Sélectionnez une image aléatoire si aucun index initial n'est fourni
            const randomImageNumber = Math.floor(Math.random() * totalBlasons) + 1;
            setSelectedImageIndex(randomImageNumber);
        }
    }, [initialImageIndex]);

    return (
        <div className="profile-picture-chooser">
            {
                <img src={`/blasons/blason${selectedImageIndex}.png`} alt={`Smiley ${selectedImageIndex}`} className={"image-container"} style={{width:"50px", height:"50px"}}  onClick={handleImageClick}/>
            }

            {showAllImages && (
                <div className="profile-picture-grid" style={{position:"absolute", zIndex:'1'}}>
                    {Array.from({ length: totalBlasons }, (_, i) => i + 1).map((number) => (
                        <img
                            key={number}
                            src={`/blasons/blason${number}.png`}
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

export default BlasonServerChooser;

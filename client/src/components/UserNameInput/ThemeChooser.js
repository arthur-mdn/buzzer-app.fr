//ThemeChooser.js
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';

function ThemeChooser({ onBackgroundSelect , initialBackground }) {
    const backgrounds = ["default", "blue", "dark", "light", "gradient", "green", "purple", "yellow"];
    const [selectedBackground, setSelectedBackground ] = useState(initialBackground);


    const handleNewBackgroundSelect = (imageName) => {
        setSelectedBackground(imageName);
        onBackgroundSelect(imageName);
    };

    return (
        <div className="profile-picture-chooser" style={{width:'100%'}}>
            <label>Fond d'écran</label>
            <div className="profile-picture-grid" style={{width:'100%'}}>
                {Array.from(backgrounds).map((name) => (
                    <img
                        key={name}
                        src={`/backgrounds/${name}.svg`}
                        alt={`Smiley ${name}`}
                        onClick={() => handleNewBackgroundSelect(name)}
                        style={{width: "55px", height:"55px", objectFit:"cover", border: name === selectedBackground ? '2px solid blue' : ""}}
                    />
                ))}
            </div>
        </div>
    );
}

export default ThemeChooser;

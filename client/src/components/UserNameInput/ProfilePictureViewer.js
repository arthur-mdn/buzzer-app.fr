import React, { useState, useEffect } from 'react';
import config from "../../config";

function ProfilePictureViewer({ imageIndex, imageColor }) {
    const [imageView, setImageView] = useState(null);

    useEffect(() => {
        const fetchAndModifySvg = async (imageNumber, color) => {
            try {
                const uniqueClassId = `cls-1-${imageNumber}-${color.replace(/#/g, '')}`;
                const response = await fetch(`/smileys/smiley_${imageNumber}.svg`);
                let svgText = await response.text();
                svgText = svgText.replace(/cls-1/g, uniqueClassId);
                svgText = svgText.replace(new RegExp(`(\\.${uniqueClassId}\\s*\\{\\s*fill\\s*:)[^;}]*(;?\\s*\\})`, 'g'), `$1 ${color}$2`);
                setImageView(svgText);
            } catch (error) {
                console.error('Error fetching SVG:', error);
            }
        };
        fetchAndModifySvg(imageIndex, imageColor);
    }, [imageIndex, imageColor]);

    return (
        <div dangerouslySetInnerHTML={{ __html: imageView }} style={{width:'3rem', height:'3rem', borderRadius:'0.6rem', overflow:'hidden'}}/>
    );
}

export default ProfilePictureViewer;

import React, { useState, useEffect } from 'react';
import {
    fetchColoredProfileSvg,
    normalizeProfileColor,
    normalizeProfileImageIndex,
} from '../../utils/profilePicture.js';

function ProfilePictureViewer({ imageIndex, imageColor, size = '3rem' }) {
    const [imageView, setImageView] = useState(null);
    const normalizedIndex = normalizeProfileImageIndex(imageIndex, false);
    const normalizedColor = normalizeProfileColor(imageColor);

    useEffect(() => {
        let cancelled = false;

        fetchColoredProfileSvg(normalizedIndex, normalizedColor)
            .then((svg) => {
                if (!cancelled) {
                    setImageView(svg);
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
    }, [normalizedIndex, normalizedColor]);

    return (
        <div
            dangerouslySetInnerHTML={{ __html: imageView }}
            style={{ width: size, height: size, borderRadius: '0.6rem', overflow: 'hidden' }}
        />
    );
}

export default ProfilePictureViewer;

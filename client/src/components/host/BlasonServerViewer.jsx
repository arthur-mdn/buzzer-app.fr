// BlasonServerViewer.jsx
import React from 'react';

function BlasonServerViewer({ imageIndex, size = '3rem' }) {

    return (
        <img src={`/blasons/blason${imageIndex}.png`} alt={`Smiley ${imageIndex}`} className={"image-container"} style={{width:"50px", height:"50px"}} />

    );
}

export default BlasonServerViewer;

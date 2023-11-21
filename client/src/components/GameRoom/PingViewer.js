// PingViewer.js
import React, { useEffect, useState } from 'react';

function PingViewer({ ping }) {
    const [pingStatus, setPingStatus] = useState('');

    useEffect(() => {
        let status = '';
        if (ping < 30) {
            status = 'strong';
        } else if (ping < 50) {
            status = 'medium';
        } else if (ping < 100) {
            status = 'weak';
        }
        setPingStatus(status);
    }, [ping]);

    return (
        <div className={"btn-push btn-push-gray"} style={{width:'fit-content', padding:'0.5rem 1rem' }}>
            {ping}
            <div className={`signal-icon ${pingStatus}`} >
                <div className="signal-bar"></div>
                <div className="signal-bar"></div>
                <div className="signal-bar"></div>
                <div className="signal-bar"></div>
            </div>
        </div>
    );
}

export default PingViewer;

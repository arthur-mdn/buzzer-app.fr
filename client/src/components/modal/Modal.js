// Modal.js
import React from "react";

function Modal({ isOpen, onClose, children, title }) {
    if (!isOpen) return null;

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div className={'modal_bg'}>
                <div className={'modal'} style={{maxWidth:'95vw'}}>
                    <div className={'modal_content_title'}>
                        <div></div>
                        <h2>{title || 'Serveur'}</h2>
                        <button className={"close btn-push"} onClick={onClose}>&times;</button>
                    </div>
                    {children}
                </div>
            </div>
    </div>
    );
}
export default Modal;

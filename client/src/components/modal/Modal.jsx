import { createPortal } from 'react-dom';
import { useId } from 'react';

function Modal({ isOpen, onClose, children, title, maxHeight = 'min(90dvh, calc(100dvh - 2rem))' }) {
    const titleId = useId();

    if (!isOpen) return null;

    return createPortal(
        <div className="modal_bg" onClick={onClose}>
            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                style={{ maxHeight }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal_content_title">
                    <h2 id={titleId}>{title || 'Serveur'}</h2>
                    <button type="button" className="close btn-push" onClick={onClose} aria-label="Fermer">&times;</button>
                </div>
                {children}
            </div>
        </div>,
        document.body
    );
}

export default Modal;

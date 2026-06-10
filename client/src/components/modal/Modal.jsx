import { createPortal } from 'react-dom';

function Modal({ isOpen, onClose, children, title, maxHeight = 'min(90dvh, calc(100dvh - 2rem))' }) {
    if (!isOpen) return null;

    return createPortal(
        <div className="modal_bg" onClick={onClose}>
            <div
                className="modal"
                style={{ maxHeight }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal_content_title">
                    <div />
                    <h2>{title || 'Serveur'}</h2>
                    <button type="button" className="close btn-push" onClick={onClose}>&times;</button>
                </div>
                {children}
            </div>
        </div>,
        document.body
    );
}

export default Modal;

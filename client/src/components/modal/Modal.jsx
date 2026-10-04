import { createPortal } from 'react-dom';
import { useEffect, useId, useRef } from 'react';

function Modal({ isOpen, onClose, onBack, children, title, maxHeight = 'min(90dvh, calc(100dvh - 2rem))' }) {
    const titleId = useId();
    const dialogRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        previousFocusRef.current = document.activeElement;
        const dialog = dialogRef.current;
        const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

        const focusFirst = () => {
            const focusable = dialog?.querySelectorAll(focusableSelector);
            if (focusable?.length) {
                focusable[0].focus();
            } else {
                dialog?.focus();
            }
        };

        focusFirst();

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose?.();
                return;
            }

            if (event.key !== 'Tab' || !dialog) {
                return;
            }

            const focusable = Array.from(dialog.querySelectorAll(focusableSelector))
                .filter((element) => !element.hasAttribute('disabled'));
            if (focusable.length === 0) {
                event.preventDefault();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            if (previousFocusRef.current instanceof HTMLElement) {
                previousFocusRef.current.focus();
            }
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="modal_bg" onClick={onClose}>
            <div
                ref={dialogRef}
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                style={{ maxHeight }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal_content_title">
                    {onBack && (
                        <button type="button" className="back btn-push" onClick={onBack} aria-label="Retour">
                            ‹
                        </button>
                    )}
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

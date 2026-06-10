import { useState } from 'react';
import Modal from '../modal/Modal.jsx';
import AboutModalContent from './AboutModalContent.jsx';

function AboutApp() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                className="btn-push about-app__trigger"
                onClick={() => setIsOpen(true)}
            >
                À propos
            </button>
            <Modal title="À propos" isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <div className="modal_content about-modal">
                    <AboutModalContent />
                </div>
            </Modal>
        </>
    );
}

export default AboutApp;

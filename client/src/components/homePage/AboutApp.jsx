import { useState } from 'react';
import Modal from '../modal/Modal.jsx';
import AboutModalContent from './AboutModalContent.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

function AboutApp() {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                className="btn-push about-app__trigger"
                onClick={() => setIsOpen(true)}
            >
                {t('about.title')}
            </button>
            <Modal title={t('about.title')} isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <div className="modal_content about-modal">
                    <AboutModalContent />
                </div>
            </Modal>
        </>
    );
}

export default AboutApp;

import React, { lazy, Suspense, useState } from 'react';
import config from '../../config';
import Modal from '../modal/Modal.jsx';
import { FaQrcode } from 'react-icons/fa6';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const QRCodeScanner = lazy(() => import('./QRCodeScanner.jsx'));

function Join({ onClose }) {
    const { t } = useLanguage();
    const [tempJoinCode, setTempJoinCode] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    const handleCodeScanned = (decodedText) => {
        setShowScanner(false);
        const serverCodeRegex = new RegExp(`${config.instanceUrl.replace(/\//g, "\\/")}\\/server\\/([\\w-]+)`);
        const match = decodedText.match(serverCodeRegex);

        if (match && match[1]) {
            const serverCode = match[1];
            window.location.href = `${config.instanceUrl}/server/${serverCode}`;
        } else {
            alert(t('join.qrInvalid'));
        }
    };

    const handleCodeScanError = (error) => {
        console.error('QR Code Scan Error:', error);
    };

    const handleJoinSubmit = async (e) => {
        e.preventDefault();

        let normalizedJoinCode = tempJoinCode.replace(/[^a-zA-Z0-9]/g, '');
        if (normalizedJoinCode.length === 12) {
            normalizedJoinCode = normalizedJoinCode.replace(/(.{4})/g, '$1-').slice(0, -1);
        }

        const validInput = /^[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}$/;

        if (!validInput.test(normalizedJoinCode)) {
            alert(t('join.codeInvalid'));
            return;
        }

        try {
            window.location.href = config.instanceUrl + "/server/" + normalizedJoinCode;
        } catch (error) {
            console.error(error);
            alert(t('common.serverCommError'));
        }
    };

    return (
        <>
            <Modal isOpen={!showScanner} title={t('join.title')} onClose={onClose}>
                <form className={'modal_content'} onSubmit={handleJoinSubmit}>
                    <label htmlFor={'name'}>{t('join.question')}</label>
                    <div style={{ display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'space-between', gap: '15px' }}>
                        <input type="text" style={{ width: '100%' }} value={tempJoinCode} required id={'name'} placeholder={'XXXX - XXXX - XXXX'} onChange={(e) => setTempJoinCode(e.target.value)} />
                    </div>
                    <button type="submit" className={'btn-push btn-push-green'} style={{ padding: '1rem 2rem' }}>{t('home.join')}</button>
                    <button type={"button"} className={'btn-push btn-push-blue'} onClick={() => setShowScanner(true)} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}><FaQrcode />{t('join.scan')}</button>
                </form>
            </Modal>
            {showScanner && (
                <Modal isOpen={true} title={t('join.scanTitle')} onClose={() => setShowScanner(false)}>
                    <div className="modal_content">
                        <Suspense fallback={<p>{t('join.scannerLoading')}</p>}>
                            <QRCodeScanner
                                qrCodeSuccessCallback={handleCodeScanned}
                                qrCodeErrorCallback={handleCodeScanError}
                            />
                        </Suspense>
                    </div>
                </Modal>
            )}
        </>
    );
}

export default Join;

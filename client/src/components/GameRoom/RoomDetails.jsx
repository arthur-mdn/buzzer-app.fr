import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Modal from "../modal/Modal.jsx";
import { QRCodeSVG } from 'qrcode.react';
import { useGame } from "../../GameContext.jsx";
import { FaEye, FaEyeSlash, FaShare } from "react-icons/fa6";
import BlasonServerViewer from "../host/BlasonServerViewer.jsx";
import config from '../../config.js';

async function copyToClipboard(text) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function RoomDetails({ serverInfo }) {
    const { serverCode } = useParams();
    const { options } = useGame();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [copiedField, setCopiedField] = useState(null);

    const joinUrl = `${config.instanceUrl}/server/${serverCode}`;

    const handleShareServer = () => {
        setIsShareModalOpen(true);
    };

    const handleCopy = async (text, field) => {
        try {
            await copyToClipboard(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField((current) => (current === field ? null : current)), 2000);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };

    return (
        <>
            <div className={"tab-content"} style={{padding:'0'}}>
                <div className={"server-info"}>
                    <BlasonServerViewer imageIndex={serverInfo.blason.blason}/>
                    <div>
                        <h2 style={{margin:'0'}}>{serverInfo.name}</h2>
                        <button onClick={() => handleShareServer()} style={{margin:'0', padding:'0.2rem 1rem', display:'flex', alignItems:'center', gap:'0.5rem'}} className={"btn-push btn-push-blue"}>
                            <FaShare/>{serverCode}
                        </button>
                    </div>
                </div>
                   {/*<div style={ (options.deductPointOnWrongAnswer || options.autoRestartAfterDecline) ? {marginBottom: "10px"} }>*/}
                   <div style={  {marginBottom: "10px"} }>
                       {options.deductPointOnWrongAnswer &&
                           <div style={{width:"100%", textAlign:"center"}}>
                               <h4 style={{margin:'0'}}>1 point retiré si mauvaise réponse</h4>
                           </div>
                       }
                       {options.autoRestartAfterDecline &&
                           <div style={{width:"100%", textAlign:"center"}}>
                               <h4 style={{margin:'0'}}>Manche relancée automatiquement en cas de mauvaise réponse</h4>
                           </div>
                       }
                       
                       <div style={{width:"100%", textAlign:"center"}}>
                           <h4  style={{margin:'0', display:'flex', alignItems:"center", justifyContent:"center", gap:"5px"}}>
                               {options.isPublic && <>
                                    <FaEye/>
                                   Serveur public
                                   </>
                               }
                               {!options.isPublic && <>
                                   <FaEyeSlash/>
                                   Serveur privé
                                   </>
                               }
                               </h4>
                       </div>

                   </div>
                <div className={"server-info-rules"}>
                    <div className={"server-info-rule"}>
                        <h4 style={{margin:'0'}}>Points nécessaires pour gagner</h4>
                        <h2 style={{margin:'0'}}>{options.winPoint}</h2>
                    </div>
                    <div style={{width:"100%", textAlign:"center"}}>
                        <h4 style={{margin:'0'}}>Points gagnés par bonne réponse</h4>
                        <h2 style={{margin:'0'}}>+{options.answerPoint}</h2>
                    </div>
                </div>

            </div>
            <Modal title={'Partager'} isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} style={{maxWidth:'none'}}>
                <div style={{ display:"flex", flexDirection:"column",alignItems:'center', justifyContent:'center',padding:'0 0 2rem 0', gap:'2rem'}}>
                    <div style={{backgroundColor:'white',borderRadius:'1rem',padding:'1rem', maxWidth: '300px'}}>
                        <QRCodeSVG value={joinUrl} size={512} style={{width: '100%', height: 'auto'}}/>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleCopy(serverCode, 'code')}
                        style={{ margin: 0, padding: '0.2rem 1rem', fontSize: '2rem' }}
                        className="btn-push btn-push-blue"
                    >
                        {copiedField === 'code' ? 'Copié !' : serverCode}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleCopy(joinUrl, 'url')}
                        style={{
                            margin: 0,
                            padding: '0.5rem 1rem',
                            fontSize: '1rem',
                            maxWidth: '100%',
                            wordBreak: 'break-all',
                            lineHeight: 1.3,
                        }}
                        className="btn-push btn-push-blue"
                    >
                        {copiedField === 'url' ? 'Copié !' : joinUrl}
                    </button>
                </div>
            </Modal>
        </>
    );
}

export default RoomDetails;

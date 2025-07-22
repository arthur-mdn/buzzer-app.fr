// RoomDetails.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Modal from "../modal/Modal.jsx";
import { QRCodeSVG } from 'qrcode.react';
import {useGame} from "../../GameContext.jsx";
import {FaEye, FaEyeSlash, FaShare} from "react-icons/fa6";
import BlasonServerViewer from "../host/BlasonServerViewer.jsx";
import config from '../../config.js';


function RoomDetails({ serverInfo }) {
    const { serverCode } = useParams();
    const { options } = useGame();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const handleShareServer = () => {
        console.log(serverCode);
        setIsShareModalOpen(true);
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
                        <QRCodeSVG value={`${config.instanceUrl}/server/${serverCode}`} size={512} style={{width: '100%', height: 'auto'}}/>
                    </div>
                    <button style={{margin:'0', padding:'0.2rem 1rem', fontSize:'2rem'}} className={"btn-push btn-push-blue"}>
                        {serverCode}
                    </button>
                </div>
            </Modal>
        </>
    );
}

export default RoomDetails;

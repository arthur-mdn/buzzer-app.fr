import React, {useState} from "react";
import config from "../../config";
import {Link} from "react-router-dom";
import Host from "../host/Host.jsx";
import Join from "../player/Join.jsx";

function HomeView() {
    const [hostModalIsOpen, setHostModalIsOpen] = useState(false); // Modal pour créer un serveur
    const [joinModalIsOpen, setJoinModalIsOpen] = useState(false); // Modal pour rejoindre un serveur

    const handleCloseJoinModal = () => {
        setJoinModalIsOpen(false);
    };
    const handleCloseHostModal = () => {
        setHostModalIsOpen(false);
    };

    return (
        <>
            {hostModalIsOpen && <Host onClose={handleCloseHostModal}/>}
            {joinModalIsOpen && <Join onClose={handleCloseJoinModal}/>}
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <img src={config.instanceUrl + '/logo.png'} alt="Logo"
                     style={{width: '100%', maxWidth: '40vh', marginTop: '3rem', aspectRatio: '1/1'}}/>
                <nav>
                    <ul style={{listStyle: 'none', padding: '0'}}>
                        <li className={'btn-push btn-push-green'} onClick={() => setHostModalIsOpen(true)}>
                            Créer
                        </li>
                        <br/>
                        <li className={'btn-push btn-push-green'} onClick={() => setJoinModalIsOpen(true)}>
                            Rejoindre
                        </li>
                    </ul>
                </nav>
        </div>
        </>

    );
}

export default HomeView;

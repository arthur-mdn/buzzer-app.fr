import React, {useState} from "react";
import UserHistory from "./UserHistory";
import PublicServerList from "./PublicServerList";

function ServerView() {
    const [serverActiveTab, setServerActiveTab] = useState('history'); // 'history' ou 'public'

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>

            <div className={'modal'}>
                <div className={'modal_content_title'}>
                    <h2>Liens rapides</h2>
                </div>
                <div style={{marginLeft: '15px', display: 'flex', gap: '10px'}}>
                    <button onClick={() => setServerActiveTab('history')}
                            className={`modal-tab ${serverActiveTab === 'history' ? 'active' : ''}`}>
                        Historique
                    </button>
                    <button onClick={() => setServerActiveTab('public')}
                            className={`modal-tab ${serverActiveTab === 'public' ? 'active' : ''}`}>
                        Public
                    </button>
                </div>
                {serverActiveTab === 'history' ? <UserHistory/> : <PublicServerList/>}
            </div>
        </div>
    );
}

export default ServerView;

import React, {useState} from "react";
import UserHistory from "./UserHistory";
import PublicServerList from "./PublicServerList";
import AdminServerList from "./AdminServerList";

function ServerView() {
    const [serverActiveTab, setServerActiveTab] = useState('history'); // 'history' ou 'public'
    const [userRole, setUserRole] = useState('user');

    const renderServerTab = () => {
        switch(serverActiveTab){
            case 'history':
                return <UserHistory/>;
            case 'public':
                return <PublicServerList/>;
            case 'admin':
                if(userRole === 'admin'){
                    return <AdminServerList/>;
                }else{
                    return "";
                }
            default:
                return "";
        }
    }
    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', margin:'0 1rem'}}>

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
                    {
                        userRole === 'admin' &&
                        <button onClick={() => setServerActiveTab('admin')}
                                className={`modal-tab ${serverActiveTab === 'admin' ? 'active' : ''}`}>
                            Admin
                        </button>
                    }

                </div>
                {
                    renderServerTab()
                }
            </div>
        </div>
    );
}

export default ServerView;

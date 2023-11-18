import React from "react";
import {useUser} from "../../UserContext";
import {useSocket} from "../../SocketContext";

function SettingsView() {
    const { userRole } = useUser();
    const socket = useSocket();

    const handleDisconnectAll = () => {
        socket.emit('adminForceDisconnect');
    };
    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            {userRole === "admin" &&
                <div>
                    <h3>YoADMIN</h3>
                    <button onClick={handleDisconnectAll} className={'btn-push btn-push-red'}>
                        Déconnecter tous les utilisateurs
                    </button>
                </div>
            }
        </div>
    );
}

export default SettingsView;

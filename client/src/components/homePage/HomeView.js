import React from "react";
import config from "../../config";
import {Link} from "react-router-dom";

function HomeView() {

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <img src={config.instanceUrl + '/logo.png'} alt="Logo"
                 style={{width: '100%', maxWidth: '300px', marginTop: '3rem', aspectRatio: '1/1'}}/>
            <nav>
                <ul style={{listStyle: 'none', padding: '0'}}>
                    <li className={'btn-push btn-push-green'}>
                        <Link to="/host">Créer</Link>
                    </li>
                    <br/>
                    <li className={'btn-push btn-push-green'}>
                        <Link to="/join">Rejoindre</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default HomeView;

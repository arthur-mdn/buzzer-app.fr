// Join.js
import React from 'react';
import { Link } from "react-router-dom";

function Join() {
    return (
    <div>
        <nav className={'modal_bg'}>
            <div className={'modal'}>
                <div className={'modal_content_title'}>
                    <h2>Rejoindre un serveur</h2>
                </div>
                <form className={'modal_content'} >
                    <label htmlFor={'name'}>Quel serveur rejoindre ?</label>
                    <div style={{display: 'flex', width: '100%', flexDirection:'column'}}>
                        <input type="text"
                               required id={'name'} placeholder={'XXXX - XXXX - XXXX'}   />
                    </div>
                    <button type="submit" className={'btn-push btn-push-green'} style={{width: '100%', padding: '1rem'}}>Rejoindre</button>
                </form>
            </div>
        </nav>
        <div className={'z_top'}>
            <Link to="/"  className={'btn-push'} style={{padding: '1rem 1.5rem'}} >{'<'}</Link>

        </div>

    </div>


    );
}

export default Join;

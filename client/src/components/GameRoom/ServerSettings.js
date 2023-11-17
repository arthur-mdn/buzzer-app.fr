// ServerSettings.js
import React from 'react';
import {useUser} from "../../UserContext";
import {useGame} from "../../GameContext";

function ServerSettings() {
    const { userId } = useUser();
    const { players, options } = useGame();
    console.log(useGame())


    return (
        <div className={"tab-content"} style={{height:'100%', overflowY:'scroll'}}>
            <div className={"server-info-rules"}>
                <div className={"server-info-rule"}>
                    <h4 style={{margin:'0'}}>Points nécessaires pour gagner</h4>options
                    <h2 style={{margin:'0'}}>{options.winPoint}</h2>
                </div>
                <div style={{width:"100%", textAlign:"center"}}>
                    <h4 style={{margin:'0'}}>Points gagnés par bonne réponse</h4>
                    <h2 style={{margin:'0'}}>+{options.answerPoint}</h2>
                </div>
                <h6 style={{margin:'0'}}>{options.deductPointOnWrongAnswer}</h6>
            </div>
        </div>
    );
}


export default ServerSettings;

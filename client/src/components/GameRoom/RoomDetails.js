// RoomDetails.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FaUser, FaCircle } from 'react-icons/fa';
import {useSocket} from "../../SocketContext";
import {useUser} from "../../UserContext";
import {useToken} from "../../TokenContext";

function RoomDetails({ serverInfo }) {
    const socket = useSocket();
    const { serverCode } = useParams();

    return (
        <div className={"tab-content"} style={{padding:'0'}}>
            <div className={"server-info"}>
                <img alt={'blason'} src={"/blasons/blason1.png"} style={{width:'50px'}}/>
                <div>
                    <h2 style={{margin:'0'}}>{serverInfo.name}</h2>
                    <h4 style={{margin:'0'}}>{serverInfo.code}</h4>
                </div>
            </div>
            <div className={"server-info-rules"}>
                <div className={"server-info-rule"}>
                    <h4 style={{margin:'0'}}>Points nécessaires pour gagner</h4>
                    <h2 style={{margin:'0'}}>{serverInfo.options.winPoint}</h2>
                </div>
                <div style={{width:"100%", textAlign:"center"}}>
                    <h4 style={{margin:'0'}}>Points gagnés par bonne réponse</h4>
                    <h2 style={{margin:'0'}}>{serverInfo.options.answerPoint}</h2>
                </div>
                <h6 style={{margin:'0'}}>{serverInfo.options.deductPointOnWrongAnswer}</h6>
            </div>
        </div>
    );
}

export default RoomDetails;

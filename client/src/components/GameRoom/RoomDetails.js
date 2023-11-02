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
        <div style={{textAlign:'center'}}>
            <h1 style={{margin:'0'}}>{serverInfo.name}</h1>
            <h3 style={{margin:'0'}}>Game Room: {serverInfo.code}</h3>
            <h3 style={{margin:'0'}}>{serverInfo.options.winPoint}</h3>
            <h3 style={{margin:'0'}}>{serverInfo.options.answerPoint}</h3>
            <h3 style={{margin:'0'}}>{serverInfo.options.deductPointOnWrongAnswer}</h3>
        </div>
    );
}

export default RoomDetails;

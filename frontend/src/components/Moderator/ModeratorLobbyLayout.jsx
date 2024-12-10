import initSocket from '../../context/socket';
import React, { useState, useRef } from 'react';



const ModeratorLobbyLayout = ({lobbyId}) => {

    const socketRef = useRef();

    if (!socketRef.current) {
        socketRef.current = initSocket();
    }

    const socket = socketRef.current;
    const [checkBeforeStart, setCheckBeforeStart] = useState(false);


    const handleSetGroups = () => {
        if (!checkBeforeStart) {
            const confirmed = window.confirm('You are about to Save the groups! Are you sure?');
            if (confirmed) {
                setCheckBeforeStart(true);
                socket.emit('changeRound', );

            }
        } else {
            console.log('Round 1 already started');
        }
    }

    return (
        <button className="start-btn" onClick={handleSetGroups}>
            Save Groups
        </button>
    )
}

export default ModeratorLobbyLayout
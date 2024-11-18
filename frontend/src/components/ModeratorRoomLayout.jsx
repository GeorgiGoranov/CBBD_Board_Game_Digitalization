import initSocket from '../context/socket';
import React, { useState, useRef } from 'react';

const ModeratorRoomLayout = ({roomId}) => {
    const socketRef = useRef();

    if (!socketRef.current) {
        socketRef.current = initSocket();
    }

    const socket = socketRef.current;

    const [checkBeforeStart, setCheckBeforeStart] = useState(false);
    const [checkBeforeNext, setCheckBeforeNext] = useState(false);


    const handleStartOfRounds = () => {
        if (!checkBeforeStart) {
            const confirmed = window.confirm('You are about to START the game! Are you sure?');
            if (confirmed) {
                setCheckBeforeStart(true);
                // Start Round 1
                socket.emit('changeRound', { roomId, roundNumber: 1 });
            }
        } else {
            console.log('Round 1 already started');
        }
    }

    const handleNextRound = () => {
        if (!checkBeforeNext) {
            const confirmed = window.confirm('You are about to go to the NEXT game! Are you sure?');
            if (confirmed) {
                setCheckBeforeNext(true);
                // Start Round 2
                socket.emit('changeRound', { roomId, roundNumber: 2 });
            }
        } else {
            console.log('Already moved to the next round');
        }
    }




    return (
        <div className="moderator-controls">
            <button className="start-btn" onClick={handleStartOfRounds}>
                Start Round 1
            </button>
            <button className="next-btn" onClick={handleNextRound}>
                Start Round 2
            </button>
        </div>

    )
}

export default ModeratorRoomLayout
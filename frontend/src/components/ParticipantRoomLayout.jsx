import React, { useState, useEffect } from 'react';


const ParticipantRoomLayout = ({ roomId, socket, playerID, group, currentRound,onLockIn  }) => {
    const [isReady, setIsReady] = useState(false);

    // Reset isReady to false when currentRound changes
    useEffect(() => {
        setIsReady(false);
    }, [currentRound]);

    const handleReadyClick = () => {
        if (!isReady) {
            // Notify the server that this player is ready
            socket.emit('playerReady', {
                roomId,
                playerID,
                group: Number(group),
            });
            setIsReady(true);
            onLockIn(true); // Notify the parent component
        } 
    };

    return (
        <div>
            <button onClick={handleReadyClick} disabled={isReady}
                className={`ready-button ${isReady ? 'ready-button--locked' : 'ready-button--default'}`}
            >
                {isReady ? 'Locked In' : 'I\'m Ready'}
            </button>
        </div>
    );
};

export default ParticipantRoomLayout;

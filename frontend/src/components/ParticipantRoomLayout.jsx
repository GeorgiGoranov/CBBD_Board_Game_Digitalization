import React, { useState, useEffect } from 'react';


const ParticipantRoomLayout = ({ roomId, socket, playerID, group, currentRound }) => {
    const [isReady, setIsReady] = useState(false);

    // Reset isReady to false when currentRound changes
    useEffect(() => {
        setIsReady(false);
    }, [currentRound]); 

    console.log(currentRound + "+" + isReady)

    const handleReadyClick = () => {
        if (!isReady) {
            // Notify the server that this player is ready
            socket.emit('playerReady', {
                roomId,
                playerID,
                group: Number(group),
            });
            setIsReady(true);
        } else {
            console.log("Already marked as ready.");
        }
    };

    return (
        <div>
            <button onClick={handleReadyClick} disabled={isReady}>
                {isReady ? 'Ready (Locked In)' : 'I\'m Ready'}
            </button>
        </div>
    );
};

export default ParticipantRoomLayout;

import initSocket from '../../context/socket';
import React, { useEffect, useState, useRef } from 'react';
import "../../SCSS/moderatorLayout.scss"

const ModeratorRoomLayout = ({ roomId }) => {
    const socketRef = useRef();
    const [currentRound, setCurrentRound] = useState(0);

    if (!socketRef.current) {
        socketRef.current = initSocket();
    }

    const socket = socketRef.current;

    // Listen for server updates about round changes
    useEffect(() => {
        socket.on('roundChanged', ({ roundNumber }) => {
            setCurrentRound(roundNumber);
            console.log(`Moderator received: current round is now ${roundNumber}`);
        });

        return () => {
            socket.off('roundChanged');
        };
    }, [socket]);



    const handleStartOfRounds = () => {
        // Only allow if we haven't started any round yet (currentRound < 1)
        if (currentRound >= 1) {
            alert('You cannot go back to Round 1. The game has already started or advanced!');
            return;
        }

        const confirmed = window.confirm('You are about to START the game! Are you sure?');
        if (confirmed) {

            // Start Round 1
            socket.emit('changeRound', { roomId, roundNumber: 1 });
        }

    }

    const handleNextRound = () => {

        // Only allow if currentRound < 2
        if (currentRound >= 2) {
            alert('You cannot reset to Round 2 because you are already in Round 2 or beyond!');
            return;
        }

        const confirmed = window.confirm('You are about to go to the NEXT game! Are you sure?');
        if (confirmed) {

            // Start Round 2
            socket.emit('changeRound', { roomId, roundNumber: 2 });
        }

    }

    const handleNextRound3 = () => {

        // Only allow if currentRound < 3
        if (currentRound >= 3) {
            alert('You cannot reset to Round 3 because you are already in Round 3 or beyond!');
            return;
        }

        const confirmed = window.confirm('You are about to go to the NEXT game! Are you sure?');
        if (confirmed) {

            // Start Round 2
            socket.emit('changeRound', { roomId, roundNumber: 3 });
        }

    }

    const handleConcludeGame = () => {

        const confirmed = window.confirm('You are about to go to the Conclude the Game! Are you sure?');
        if (confirmed) {
            // Stop the game
            socket.emit('stopGame', { roomId });
        }

    }

    const handleNextCard = () => {


        // Stop the game
        socket.emit('next-card-3', { roomId });


    }



    return (
        <div className="moderator-controls">
            <button className="start-btn" onClick={handleStartOfRounds}>
                Start Round 1
            </button>
            <button className="next-btn" onClick={handleNextRound}>
                Start Round 2
            </button>
            <button className="next-btn" onClick={handleNextRound3}>
                Start Round 3
            </button>
            <button className="stop-game-btn" onClick={handleConcludeGame}>
                Stop Game
            </button>
            <button className='next-card' onClick={handleNextCard}>
                Next Card
            </button>
        </div>

    )
}

export default ModeratorRoomLayout
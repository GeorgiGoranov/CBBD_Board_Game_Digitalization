import initSocket from '../../context/socket';
import React, { useState, useRef } from 'react';
import "../../SCSS/moderatorLayout.scss"

const ModeratorRoomLayout = ({ roomId }) => {
    const socketRef = useRef();

    if (!socketRef.current) {
        socketRef.current = initSocket();
    }

    const socket = socketRef.current;



    const handleStartOfRounds = () => {

        const confirmed = window.confirm('You are about to START the game! Are you sure?');
        if (confirmed) {

            // Start Round 1
            socket.emit('changeRound', { roomId, roundNumber: 1 });
        }

    }

    const handleNextRound = () => {

        const confirmed = window.confirm('You are about to go to the NEXT game! Are you sure?');
        if (confirmed) {

            // Start Round 2
            socket.emit('changeRound', { roomId, roundNumber: 2 });
        }

    }

    const handleNextRound3 = () => {

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
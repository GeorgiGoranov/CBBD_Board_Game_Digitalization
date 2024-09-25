import React, { useState, useEffect } from 'react';
import io from 'socket.io-client'



const HomeDefautUser = () => {
    const [playerID, setPlayerID] = useState('');
    const [gameCode, setGameCode] = useState('');
    const [message, setMessage] = useState('');
    const [players, setPlayers] = useState([]);


    const socket = io('http://localhost:4000');

    const joinGameSession = async () => {
         // Emit an event to join the session via WebSocket
         socket.emit('joinSession', { code: gameCode, playerID });
        // Make a POST request to the backend to join the session
        const response = await fetch('/api/routes/join-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: gameCode, playerID }),
        });

        const data = await response.json();
        if (response.ok) {
           
           
            setMessage('Successfully joined the game session!');
            console.log(response)

        } else {
            setMessage(data.message || 'Error joining the session');
        }
    };

    useEffect(() => {
        // Listen for new players joining the session
        socket.on('playerJoined', ({ playerID, players }) => {
            setPlayers(players);  // Update the players state with the updated list
            setMessage(`${playerID} has joined the session`);
        });

        return () => {
            socket.off('playerJoined');  // Clean up listener when component unmounts
        };
    }, [socket])

    return (
        <div>
            <h2>Join a Game Session</h2>
            <input
                type="text"
                value={playerID}
                onChange={(e) => setPlayerID(e.target.value)}
                placeholder="Enter your name"
            />
            <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                placeholder="Enter the game code"
            />
            <button onClick={joinGameSession}>Join Session</button>
            {message && <p>{message}</p>}
            <h3>Players in the session:</h3>
            <ul>
                {players.map((player, index) => (
                    <li key={index}>{player}</li>
                ))}
            </ul>

        </div>
    );
};

export default HomeDefautUser;

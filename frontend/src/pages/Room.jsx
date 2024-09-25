import io from 'socket.io-client'
import React, { useState, useEffect } from 'react';
const Room = () =>{

    const socket = io('http://localhost:4000');
    const [players, setPlayers] = useState([]);
    const [message, setMessage] = useState('');

    
    useEffect(() => {
        // Listen for new players joining the session
        socket.on('playerJoined', ({ playerID, players }) => {
           // setPlayers(players);  // Update the players state with the updated list
            setMessage(`${playerID} has joined the session`);
        });

        return () => {
            socket.off('playerJoined');  // Clean up listener when component unmounts
        };
    }, [socket])
    return(
        <div>
            <h1>Room</h1>

            <h3>Players in the session:</h3>
            <ul>
                {players.map((player, index) => (
                    <li key={index}>{player}</li>
                ))}
            </ul>

             {message && <p>{message}</p>}
        </div>
    )
}

export default Room
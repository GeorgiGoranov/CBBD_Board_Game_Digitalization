import React, { useState, useEffect } from 'react';
import io from 'socket.io-client'

const Room = () =>{

    const socket = io('http://localhost:4000');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Listen for new players joining the session
        socket.on('playerJoined', (data) => {
            // setPlayers(players);  // Update the players state with the updated list
            setMessage(`${data.playerID} joined the game!`);

        });

    }, [])
    return(
        <div>
            <h1>Room</h1>
            {message && <p>{message}</p>}
        </div>
    )
}


export default Room
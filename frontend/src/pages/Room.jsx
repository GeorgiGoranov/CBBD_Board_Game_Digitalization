import React, { useState, useEffect } from 'react';
import io from 'socket.io-client'

const socket = io('http://localhost:4000');
const Room = () =>{

    const [message, setMessage] = useState('');

    useEffect(() => {
        // Listen for new players joining the session
        socket.on('playerJoined', (data) => {
            // setPlayers(players);  // Update the players state with the updated list
            setMessage(`${data.playerID} joined the game!`);

        });

        // Cleanup the socket listener on component unmount
    return () => {
        socket.off('playerJoined');
      };

    }, [])
    return(
        <div>
            <h1>Room</h1>
            {message && <p>{message}</p>}
        </div>
    )
}


export default Room
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client'



const HomeDefautUser = () => {
    const [playerID, setPlayerID] = useState('');
    const [gameCode, setGameCode] = useState('');
    const [message, setMessage] = useState('');


    const socket = io('http://localhost:4000');

    const joinGameSession = async () => {
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

    const [infoMess, setInfoMess] = useState('')
    const [receivedinfoMess, setreceivedInfoMess] = useState('')

    const sendMessage = () => {
        socket.emit('send_message', { message: infoMess }); // Correct event name
    }

    useEffect(() => {
        socket.on('receive_message', (data) => {
            setreceivedInfoMess(data.message)

        })
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

            <h3>Send a Message:</h3>
            <input placeholder='Message... '
                onChange={(event) => {
                    setInfoMess(event.target.value)
                }} />
            <button onClick={sendMessage}>Send Message</button> {/* Use onClick here */}
            <h1>Message: </h1>
            {receivedinfoMess}

        </div>
    );
};

export default HomeDefautUser;

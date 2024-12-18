import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import initSocket from '../context/socket';
import "../SCSS/pHomeLayout.scss"


const HomeDefautUser = () => {
    const [playerUsername, setPlayerUsername] = useState('');
    const [gameCode, setGameCode] = useState('');
    const [message, setMessage] = useState('');
    const [nationality, setNationality] = useState('')

    const socket = initSocket();

    const navigate = useNavigate()

    // Disconnect from the WebSocket when on the HomeDefautUser page
    useEffect(() => {
        // Disconnect socket when the page loads
        socket.disconnect();

        return () => {
            // Disconnect again in case the component is unmounted
            socket.disconnect();
        };
    }, [socket]);

    const joinLobbySession = async () => {

        // Make a POST request to the backend to join the session
        const response = await fetch('/api/routes/join-lobby-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: gameCode, playerUsername,nationality }),
        });

        const data = await response.json();
        if (response.ok) {
            setMessage('Successfully joined the game session!');
            
            navigate(`/lobby/${gameCode}`);
            
        } else {
            setMessage(data.message || 'Error joining the session');
        }
    };


    return (
        <div >
            <div className='join-container'>

                <h2>Join a Game Session</h2>
                <input
                    type="text"
                    value={playerUsername}
                    onChange={(e) => setPlayerUsername(e.target.value)}
                    placeholder="Enter your name"
                />
                <input
                    type="text"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value)}
                    placeholder="Enter the game code"
                />

                <select
                    className="input"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="Select a Nationality">
                    <option value="" disabled>Select a Nationality</option>
                    <option value="german">German</option>
                    <option value="dutch">Dutch</option>
                    <option value="other">Other</option>
                </select>

            </div>
            <button onClick={joinLobbySession}>Join Session</button>
            {message && <p>{message}</p>}

        </div>
    );
};

export default HomeDefautUser;

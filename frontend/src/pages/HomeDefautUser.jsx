import React, { useState,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import initSocket from '../context/socket';


const HomeDefautUser = () => {
    const [playerID, setPlayerID] = useState('');
    const [gameCode, setGameCode] = useState('');
    const [message, setMessage] = useState('');
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
            localStorage.setItem('playerID', playerID);  // Store in localStorage
            navigate(`/room/${gameCode}`);

        } else {
            setMessage(data.message || 'Error joining the session');
        }
    };

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

        </div>
    );
};

export default HomeDefautUser;

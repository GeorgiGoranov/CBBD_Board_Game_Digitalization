import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import initSocket from '../context/socket';
import "../SCSS/pHomeLayout.scss"
import Select from 'react-select';


const HomeDefautUser = () => {
    const [playerUsername, setPlayerUsername] = useState('');
    const [gameCode, setGameCode] = useState('');
    const [message, setMessage] = useState('');
    const [nationality, setNationality] = useState('')
    const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;

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
        // Check if all required fields are filled
        if (!playerUsername.trim() || !gameCode.trim() || !nationality) {
            setMessage('Please fill out all fields before proceeding.');
            return;
        }

        // Make a POST request to the backend to join the session
        const response = await fetch(`${apiUrl}/api/routes/join-lobby-session`, {
            method: 'POST',
            credentials: 'include', // Include JWT cookies
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: gameCode, playerUsername, nationality }),
        });

        const data = await response.json();
        if (response.ok) {
            setMessage('Successfully joined the game session!');

            navigate(`/lobby/${gameCode}`);

        } else {
            setMessage(data.message || 'Error joining the session');
        }
    };

    const nationalityOptions = [
        { value: 'german', label: 'German' },
        { value: 'dutch', label: 'Dutch' },
        { value: 'other', label: 'Other' },
    ];


    return (
        <div className='duser-container'>
            <div className='join-container'>

                <h2>Join a Game Session</h2>
                <input
                    type="text"
                    value={playerUsername}
                    onChange={(e) => setPlayerUsername(e.target.value)}
                    placeholder="Enter your username"
                />
                <input
                    type="text"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value)}
                    placeholder="Enter the game code"
                />

                <Select className='select-react'
                    options={nationalityOptions}
                    value={nationalityOptions.find(option => option.value === nationality)} // Find the selected object for the value
                    onChange={(selectedOption) => setNationality(selectedOption.value)} // Set only the value
                    placeholder="Select a Nationality"
                />

            </div>
            <button onClick={joinLobbySession}>Join Session</button>
            {message && <div className='error'>{message}</div>}

        </div>
    );
};

export default HomeDefautUser;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import initSocket from '../context/socket';
import ModeratorRoomLayout from '../components/ModeratorRoomLayout';

import { useLanguage } from '../context/LanguageContext';

let hasJoined = false // Ref to track if the user has already joined

const Room = () => {
    const { roomId } = useParams(); // Fetch roomId from the URL
    const [message, setMessage] = useState('');
    const [players, setPlayers] = useState([]);
    const [playerID, setPlayerID] = useState('');
    const [role, setRole] = useState(null); // Role state to determine layout
    const [loading, setLoading] = useState(true);
    const socket = initSocket();
    const navigate = useNavigate()
    const { language } = useLanguage(); // Access selected language


    useEffect(() => {

        const fetchUserRole = async () => {
            try {
                const response = await fetch('/api/routes/user-role', {
                    method: 'GET',
                    credentials: 'include', // Include JWT cookies
                });
                const data = await response.json();

                if (response.ok) {
                    setRole(data.role); // Set the role (e.g. "admin" or "user")
                    console.log(data.role)
                }
            } catch (error) {
                console.error('Error fetching role:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
        // Retrieve playerID from localStorage
        const storedPlayerID = localStorage.getItem('playerID');
        setPlayerID(storedPlayerID);

        // Connect the socket if it's not already connected
        if (!socket.connected) {
            socket.connect();
        }

        /* when the page is ran for the first time the boolean is false, 
        we check the stored value in the localStorage and if we have 
        we also check if we have roomID and if so we go in the if statement
        after it has ran once it will try again but because now the value
        of hasJoined is set to true it does not go inside.

        it can be done with useRef react hook but it is almost the same context as the boolean
        */
        if (!hasJoined && storedPlayerID && roomId) {
            hasJoined = true;
            // Automatically reconnect the user to the room
            socket.connect()
            socket.emit('joinSession', { playerID: storedPlayerID, gameCode: roomId });
        } else if (!storedPlayerID) {
            //if user is unknow navigate him to dafault page
            navigate('/duser')
        }

        // Listen for new players joining the session
        socket.on('playerJoined', (data) => {
            // setPlayers(players);  // Update the players state with the updated list
            setMessage(`${data.playerID} joined the game!`);

        });

        // Listen for updates to the player list
        socket.on('updatePlayerList', (playerList) => {
            setPlayers(playerList);  // Update the player list when received from the server
        });
        
        socket.on('playerLeftRoom', (playerList) => {
            setMessage(`${playerList} left the game!`);  
        });

        // Cleanup listener when the component unmounts
        return () => {
            socket.off('playerJoined'); // Remove the listener when the component unmounts
            socket.off('updatePlayerList');
        };
    }, [roomId, socket, navigate]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className='room-container'>
            <h1>Room ID: {roomId}</h1>
            {message && <p>{message}</p>}
            <h1>language:{language}</h1>

            <h2>Players in the Room:</h2>
            <ul>
                {players.map((player, index) => (
                    <li key={index}>{player}</li>
                ))}
            </ul>

            {role === 'admin' ? (
                <div>Moderator Layout for Room {roomId}
                <ModeratorRoomLayout/>
               
                </div>
                
            ) : (
                <div>Player Layout for Room {roomId}</div>
            )}

        </div>
    )
}


export default Room
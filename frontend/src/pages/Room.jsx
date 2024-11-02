import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import initSocket from '../context/socket';
import ModeratorRoomLayout from '../components/ModeratorRoomLayout';
import { useLanguage } from '../context/LanguageContext';
import "../SCSS/room.scss"
import "../SCSS/moderatorContainerLayout.scss"
import ParticipantRoomLayout from '../components/ParticipantRoomLayout';
import Rounds from '../components/Rounds';

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
    const [randomCardsC, setRandomCardsC] = useState([]);


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
                    console.log(data.name)

                }
            } catch (error) {
                console.error('Error fetching role:', error);
            } finally {
                setLoading(false);
            }
        };

        const storedPlayerID = localStorage.getItem('playerID');
        fetchUserRole();
        // Retrieve playerID from localStorage
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
            fetchRandomCards();
        
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

    const fetchRandomCards = async () => {
        try {
            const response = await fetch('/api/cards/competency/random'); // Adjust endpoint path
            if (!response.ok) throw new Error('Error fetching cards');
            const data = await response.json();
            setRandomCardsC(data);
            
        } catch (error) {
            console.log(error)
        }
    };


    if (loading) return <div>Loading...</div>;

    return (
        <div className='room-container'>
            <div className="information-pannel">
                <h1>Room ID: {roomId}</h1>
                {message && <p>{message}</p>}

                <h2>Players in the Room:</h2>
                <ul>
                    {players.map((player, index) => (
                        <li key={index}>{player}</li>
                    ))}
                </ul>
                <ul className='api-list'>
                    {randomCardsC.map((card, index) => (
                        <li className='api-item' key={index}>
                            <h3>{card.category}</h3>
                            <p>Subcategory: {card.subcategory}</p>
                            <p>Options ({language}): {card.options[language] || 'Not available'}</p>
                        </li>
                    ))}
                </ul>
                <Rounds />
            </div>
            <div className="role-based-layout">
                {role === 'admin' ? (
                    <div className='moderator-container-layout'>Moderator Layout for Room {roomId}

                        <ModeratorRoomLayout />

                    </div>

                ) : (
                    <div>Player Layout for Room {roomId}
                        <ParticipantRoomLayout />
                    </div>
                )}

            </div>


        </div>
    )
}


export default Room
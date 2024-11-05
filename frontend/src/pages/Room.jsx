import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModeratorRoomLayout from '../components/ModeratorRoomLayout';
import { useLanguage } from '../context/LanguageContext';
import ParticipantRoomLayout from '../components/ParticipantRoomLayout';
import Rounds from '../components/Rounds';
import initSocket from '../context/socket';
import "../SCSS/room.scss"
import "../SCSS/moderatorContainerLayout.scss"

let hasJoined = false // Ref to track if the user has already joined


const Room = () => {
    const { roomId } = useParams(); // Fetch roomId from the URL
    const [message, setMessage] = useState('');
    const [players, setPlayers] = useState([]);
    const [playerID, setPlayerID] = useState('');
    const [role, setRole] = useState(null); // Role state to determine layout
    const [loading, setLoading] = useState(true);
    const socketRef = useRef();
    const navigate = useNavigate()
    const { language } = useLanguage(); // Access selected language
    const [cards, setCards] = useState({ competencyCard: [], otherCard: [] });

    if (!socketRef.current) {
        socketRef.current = initSocket();
    }

    const socket = socketRef.current;

    const fetchUserRole = async () => {
        try {
            const response = await fetch('/api/routes/user-role', {
                method: 'GET',
                credentials: 'include', // Include JWT cookies
            });
            const data = await response.json();

            if (response.ok) {
                setRole(data.role); // Set the role (e.g. "admin" or "user")
                setPlayerID(data.id);
                console.warn(data)
            }
        } catch (error) {
            console.error('Error fetching role:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllCards = async () => {
        const [competencyCard, otherCard] = await Promise.all([
            fetch('/api/cards/competency/random').then(res => res.json()),
            fetch('/api/cards/other/random').then(res => res.json())
        ]);

        setCards({ competencyCard, otherCard });
    };

    useEffect(() => {
        fetchUserRole()
        fetchAllCards()
    }, [])

    useEffect(() => {
        // Connect the socket if it's not already connected
        if (!socket.connected) {
            socket.connect();
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
            socket.off('playerLeftRoom')
        };
    }, [socket]);

    useEffect(() => {
        if (playerID && roomId) {
            socket.emit('joinSession', { playerID, gameCode: roomId });
        }

    }, [playerID, roomId, socket])



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
                <h2>Competency Cards</h2>
                <ul className='api-list'>
                    {cards.competencyCard.map((card, index) => (
                        <li className='api-item' key={index}>
                            <h3>{card.category}</h3>
                            <p>Subcategory: {card.subcategory}</p>
                            <p>Options ({language}): {card.options[language] || 'Not available'}</p>
                        </li>
                    ))}
                </ul>

                <h2>Other Cards</h2>
                <ul className='api-list'>
                    {cards.otherCard.map((card, index) => (
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
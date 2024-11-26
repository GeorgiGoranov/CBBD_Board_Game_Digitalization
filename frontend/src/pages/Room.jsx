import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModeratorRoomLayout from '../components/ModeratorRoomLayout';
import ParticipantRoomLayout from '../components/ParticipantRoomLayout';

import Chat from '../components/Chat';
import initSocket from '../context/socket';
import "../SCSS/room.scss"
import "../SCSS/moderatorContainerLayout.scss"
import RoundOne from '../components/RoundOne';
import RoundTwo from '../components/RoundTwo';
import RoundThree from '../components/RoundThree';



const Room = () => {
    const { roomId } = useParams(); // Fetch roomId from the URL
    const [message, setMessage] = useState('');
    const [players, setPlayers] = useState([]);
    const [playerID, setPlayerID] = useState('');
    const [role, setRole] = useState(null); // Role state to determine layout
    const [loading, setLoading] = useState(true);
    const socketRef = useRef();
    const navigate = useNavigate()
    const [userSessionCode, setUserSessionCode] = useState(null);
    const [currentRound, setCurrentRound] = useState(0); // Start at round 0


    if (!socketRef.current) {
        socketRef.current = initSocket();
    }

    const socket = socketRef.current;

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await fetch('/api/routes/user-role', {
                    method: 'GET',
                    credentials: 'include', // Include JWT cookies
                });
                const data = await response.json();

                if (response.ok) {
                    setUserSessionCode(data.sessionCode);
                    setRole(data.role);
                    setPlayerID(data.name);

                } else {
                    navigate('/duser')
                }
            } catch (error) {
                console.error('Error fetching role:', error);
                navigate('/duser');
            } finally {
                setLoading(false);
            }
        };


        if (userSessionCode != null && userSessionCode !== roomId) {
            // User is trying to access a room they haven't joined
            navigate('/duser'); // Redirect to home or show an error
        } else {

            fetchUserRole()
        }
    }, [userSessionCode, navigate, roomId])

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

        socket.on('roundChanged', ({ roundNumber }) => {
            setCurrentRound(roundNumber);
            console.log(`Round changed to ${roundNumber}`);
        });

        // Cleanup listener when the component unmounts
        return () => {
            socket.off('playerJoined'); // Remove the listener when the component unmounts
            socket.off('updatePlayerList');
            socket.off('playerLeftRoom');
            socket.off('roundChanged');
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
            <div className='test-layout'>
                <h1>Room ID: {roomId}</h1>
                {message && <p>{message}</p>}

                <h2>Players in the Room:</h2>
                <ul>
                    {players.map((player, index) => (
                        <li key={index}>{player}</li>
                    ))}
                </ul>
            </div>

            <div className='information-pannel'>
                {/* Render RoundOne component */}
                {currentRound === 1 && (
                    <div>
                        Round 1
                        <RoundOne roomId={roomId} playerID={playerID} socket={socket} />

                    </div>
                )}
                {currentRound === 2 && (
                    <div>
                        Round 2
                        <RoundTwo roomId={roomId} playerID={playerID} socket={socket} />

                    </div>
                )}
                {currentRound === 3 && (
                    <div>
                        Round 3
                        <RoundThree roomId={roomId} playerID={playerID} socket={socket} />

                    </div>
                )}
                {/* Chat Component */}
                <Chat playerID={playerID} socket={socket} />
            </div>

            {/* Role-based layout */}
            <div className='role-based-layout'>
                {role === 'admin' ? (
                    <div className='moderator-container-layout'> Moderator Layout for Room {roomId}
                        <ModeratorRoomLayout roomId={roomId}/>
                    </div>
                ) : (
                    <div>
                        <div>Player Layout for Room {roomId}
                            <ParticipantRoomLayout />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}


export default Room
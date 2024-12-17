import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModeratorRoomLayout from '../components/Moderator/ModeratorRoomLayout';
import ParticipantRoomLayout from '../components/ParticipantRoomLayout';

import initSocket from '../context/socket';
import "../SCSS/room.scss"

import Chat from '../components/Rooms/Chat';
import RoundOne from '../components/Rooms/RoundOne';
import RoundTwo from '../components/Rooms/RoundTwo';
import RoundThree from '../components/Rooms/RoundThree';



const Room = () => {
    const { roomId } = useParams(); // Fetch roomId from the URL
    const [playerID, setPlayerID] = useState('');
    const [message, setMessage] = useState('');
    const socketRef = useRef();

    const [players, setPlayers] = useState([]);
    const [role, setRole] = useState(null); // Role state to determine layout
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()
    const [userSessionCode, setUserSessionCode] = useState(null);
    const [currentRound, setCurrentRound] = useState(0); // Start at round 0
    const [group, setGroup] = useState('');

    const [adminMessage, setAdminMessage] = useState('');
    const [targetGroup, setTargetGroup] = useState('');
    const [socketMessage, setSocketMessage] = useState(''); // This can be used to display socket events



    if (!socketRef.current) {
        socketRef.current = initSocket();
    }

    const socket = socketRef.current;

    useEffect(() => {



        const fetchUserRole = async () => {
            try {
                const response = await fetch('/api/routes/user-role-updated', {
                    method: 'GET',
                    credentials: 'include', // Include JWT cookies
                });
                const data = await response.json();

                if (response.ok) {
                    setUserSessionCode(data.sessionCode);
                    setRole(data.role);
                    setPlayerID(data.name);
                    setGroup(data.group)

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

        // Listen for group messages
        socket.on('receiveGroupMessage', ({ message }) => {
            console.log(message)

            // Only the targeted group members will get this
            console.log("Group message received:", message);
            // You can display it in the UI as needed
            setSocketMessage(`Recruitment Job: ${message}`);
        });

        // Cleanup listener when the component unmounts
        return () => {
            socket.off('playerJoined'); // Remove the listener when the component unmounts
            socket.off('updatePlayerList');
            socket.off('playerLeftRoom');
            socket.off('roundChanged');
            socket.off('receiveGroupMessage');
        };
    }, [socket]);

    useEffect(() => {
        if (playerID && roomId) {
            socket.emit('joinSession', { playerID, gameCode: roomId, group: String(group) });
        }

    }, [playerID, roomId, socket, group])


    if (loading) return <div>Loading...</div>;

    const handleAdminFormSubmit = (e) => {
        e.preventDefault();
        if (adminMessage.trim() && targetGroup) {
            // Emit an event to the server to send a message to a specific group
            socket.emit('sendGroupMessage', {
                roomId,
                group: targetGroup,
                message: adminMessage
            });
            console.log(targetGroup + "+" + adminMessage)
            setAdminMessage('');
            setTargetGroup('');
        }
    };

    return (

        <div className='room-container'>
            <div className='question-by-moderator'>
                {role === "admin" && (
                    <form onSubmit={handleAdminFormSubmit}>
                        <input
                            type="text"
                            value={adminMessage}
                            onChange={(e) => setAdminMessage(e.target.value)}
                            placeholder="Enter your Recruitment Job?"
                        />
                        <select
                            value={targetGroup}
                            onChange={(e) => setTargetGroup(e.target.value)}
                        >
                            <option value="">Select a Group</option>
                            <option value="1">G1</option>
                            <option value="2">G2</option>
                            <option value="3">G3</option>
                            <option value="4">G4</option>
                        </select>
                        <button type="submit">Submit</button>
                    </form>
                )}

            </div>
            {/* <div className='test-layout'>
                <h1>Room ID: {roomId}</h1>
                {message && <p>{message}</p>}
                
                <h2>Players in the Room:</h2>
                <ul>
                {players.map((player, index) => (
                    <li key={index}>
                    {/* Check if the player is an object and render the playerID or other relevant property */}
            {/* {typeof player === 'object' ? player.playerID : player} */}
            {/* </li> */}
            {/* ))} */}
            {/* </ul> */}

            {/* </div>  */}

            <h2>Group Number: {group}</h2>
            {socketMessage && <p>{socketMessage}</p>}
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
                        <RoundThree roomId={roomId} playerID={playerID} socket={socket} role={role} />

                    </div>
                )}
                {/* Chat Component */}
                <div className='chat'>

                <Chat playerID={playerID} socket={socket} group={group}/>
                </div>
            </div>

            {/* Role-based layout */}
            <div className='role-based-layout'>
                {role === 'admin' ? (
                    <div className='moderator-container-layout'> Moderator Layout for Room {roomId}
                        <ModeratorRoomLayout roomId={roomId} />
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
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
import GroupDiscussion from '../components/Rooms/GroupDiscussion';



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
    // const [socketMessage, setSocketMessage] = useState(''); // This can be used to display socket events
    const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;
    const [nationality, setNationality] = useState('')

    const [availableGroups, setAvailableGroups] = useState([]); // Unique group numbers
    const [selectedGroups, setSelectedGroups] = useState([]); // Selected groups via checkboxes

    const [showGroupDiscussion, setShowGroupDiscussion] = useState(false); // New state


    if (!socketRef.current) {
        socketRef.current = initSocket();
    }

    const socket = socketRef.current;

    useEffect(() => {
        // Extract unique groups dynamically from players, filtering out undefined or invalid values
        const extractUniqueGroups = () => {
            if (players.length > 0) {
                const uniqueGroups = Array.from(
                    new Set(players.map((player) => player.group).filter((group) => group !== 'undefined' && group !== null))
                ); // Ensure groups are defined and not null
                setAvailableGroups(uniqueGroups);
            }
        };

        extractUniqueGroups();
    }, [players]); // Re-run when players list changes

    // Handle checkbox toggle for groups
    const handleCheckboxChange = (groupNumber) => {
        setSelectedGroups((prevSelected) =>
            prevSelected.includes(groupNumber)
                ? prevSelected.filter((g) => g !== groupNumber) // Remove if already selected
                : [...prevSelected, groupNumber] // Add if not selected
        );
    };


    useEffect(() => {

        const fetchUserRole = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/routes/user-role-updated`, {
                    method: 'GET',
                    credentials: 'include', // Include JWT cookies
                });
                const data = await response.json();

                if (response.ok) {
                    setUserSessionCode(data.sessionCode);
                    setRole(data.role);
                    setPlayerID(data.name);
                    setGroup(data.group)
                    setNationality(data.nationality);

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

        socket.on('gameStopped', () => {
            console.warn(role)
            // Force them back to the start or wherever you want
            if (role !== 'admin') {
                navigate('/duser');
            } else {
                navigate('/muser');
            }
        });

        socket.on('groupDiscussionStarted', () => {
            setShowGroupDiscussion(true); // Show group discussion UI
        });

        socket.on('groupDiscussionEnded', () => {
            setShowGroupDiscussion(false); // Hide group discussion UI
        });

        // Cleanup listener when the component unmounts
        return () => {
            socket.off('playerJoined'); // Remove the listener when the component unmounts
            socket.off('updatePlayerList');
            socket.off('playerLeftRoom');
            socket.off('roundChanged');
            socket.off('gameStopped');
            socket.off('groupDiscussionStarted');
            socket.off('groupDiscussionEnded');
        };
    }, [socket, role, navigate]);



    useEffect(() => {
        if (playerID && roomId) {
            socket.emit('joinSession', { playerID, gameCode: roomId, group: String(group) });
        }

    }, [playerID, roomId, socket, group])


    if (loading) return <div>Loading...</div>;

    // Handle form submission for checkboxes
    const handleAdminFormSubmit = (e) => {
        e.preventDefault();
        if (adminMessage.trim() && selectedGroups.length > 0) {
            // Emit an event to the server to send a message to the selected groups
            socket.emit('sendGroupMessage', {
                roomId,
                groups: selectedGroups, // Send the array of selected groups
                message: adminMessage,
            });

            setAdminMessage('');
            setSelectedGroups([]); // Clear selected groups after sending the message
        }
    };

    return (
        <div className='room-container'>
            {showGroupDiscussion ? (
                <GroupDiscussion 
                roomId={roomId}
                apiUrl={apiUrl}
                availableGroups={availableGroups}
                socket={socket}
                group={group}
                playerID={playerID} 
                role={role}
                currentRound={currentRound}
                />
            ) : (
                <>
                    {role === 'admin' ? (
                        <>
                            <div className='question-by-moderator'>

                                <form onSubmit={handleAdminFormSubmit}>
                                    <input
                                        type="text"
                                        value={adminMessage}
                                        onChange={(e) => setAdminMessage(e.target.value)}
                                        placeholder="Enter your Recruitment Job?"
                                    />
                                    <div className="selected-groups">
                                        <h4>Select Groups:</h4>
                                        <div className="group-checkboxes">
                                            {availableGroups.map((groupNumber) => (
                                                <label key={groupNumber} className="group-checkbox">
                                                    <input
                                                        className='checkbox-input'
                                                        type="checkbox"
                                                        value={groupNumber}
                                                        checked={selectedGroups.includes(groupNumber)}
                                                        onChange={() => handleCheckboxChange(groupNumber)}
                                                    />
                                                    Group {groupNumber}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <button type="submit">Submit</button>
                                </form>


                            </div>
                        </>

                    ) : (

                        <div className='outer-container'>
                            <h2>Group Number: {group}</h2>
                            <div className='information-pannel'>
                                {/* Render RoundOne component */}
                                {currentRound === 1 && (
                                    <div>
                                        Round 1
                                        <RoundOne roomId={roomId} playerID={playerID} socket={socket} group={group} />

                                    </div>
                                )}
                                {currentRound === 2 && (
                                    <div>
                                        Round 2
                                        <RoundTwo roomId={roomId} playerID={playerID} socket={socket} group={group} />

                                    </div>
                                )}
                                {/* Chat Component - Only for Round 1 and Round 2 */}
                                {(currentRound === 1 || currentRound === 2) && (
                                    <div className='chat'>
                                        <Chat playerID={playerID} socket={socket} group={group} />
                                    </div>
                                )}
                            </div>
                        </div>

                    )}

                    {currentRound === 3 && (
                        <div>
                            Round 3
                            <RoundThree roomId={roomId} playerID={playerID} socket={socket} role={role} nationality={nationality} />

                        </div>
                    )}

                </>)

            }
            {/* Role-based layout */}
            <div className='role-based-layout'>
                {role === 'admin' ? (
                    <div className='moderator-container-layout'> Moderator Layout for Room {roomId}
                        <ModeratorRoomLayout roomId={roomId} />
                    </div>
                ) : (
                    <div>
                        {/* <div>Player Layout for Room {roomId}
                                <ParticipantRoomLayout />
                            </div> */}
                    </div>
                )}
            </div>


        </div>
    )
}


export default Room
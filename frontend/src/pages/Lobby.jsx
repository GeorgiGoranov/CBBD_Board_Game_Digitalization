import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import initSocket from '../context/socket';
import "../SCSS/lobby.scss"
import { motion, AnimatePresence } from 'framer-motion';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


const Lobby = () => {
    const { roomId } = useParams(); // Fetch roomId from the URL
    const [players, setPlayers] = useState([]);
    const [groupedPlayers, setGroupedPlayers] = useState([]);

    const socketRef = useRef();
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [userSessionCode, setUserSessionCode] = useState(null);
    const [role, setRole] = useState(null); // Role state to determine layout
    const navigate = useNavigate()
    const [playerID, setPlayerID] = useState('');
    const [nationality, setNationality] = useState('')

    const [checkmessage, setCheckMessage] = useState(null);
    const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;

    const [groupsLocked, setGroupsLocked] = useState(false);

    const [categories, setCategories] = useState([]);

    const [showPopup, setShowPopup] = useState(false);  // New state for popup

    const [totalPlayers, setTotalPlayers] = useState(0);





    if (!socketRef.current) {
        socketRef.current = initSocket();
    }
    const socket = socketRef.current;


    // Split players into subgroups of three
    const splitIntoGroups = (playersArray) => {
        const groups = [];
        for (let i = 0; i < playersArray.length; i += 3) {
            groups.push(playersArray.slice(i, i + 3));
        }
        return groups;
    };


    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/routes/user-role`, {
                    method: 'GET',
                    credentials: 'include', // Include JWT cookies
                });
                const data = await response.json();

                if (response.ok) {
                    setUserSessionCode(data.sessionCode);
                    setRole(data.role);
                    setPlayerID(data.name);
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
    }, [userSessionCode, navigate, roomId,apiUrl])

    useEffect(() => {
        // Connect the socket if it's not already connected
        if (!socket.connected) {
            socket.connect();
        }

        // Listen for navigation event
        socket.on('navigateToRoom', (data) => {
            if (data.roomId === roomId) {
                navigate(`/room/${roomId}`, { state: { groupedPlayers } });
            }
        });

        // Listen for new players joining the session
        socket.on('playerJoined', (data) => {
            // setPlayers(players);  // Update the players state with the updated list
            addMessage(`${data.playerID} joined the game!`);
        });

        // Listen for updates to the player list
        socket.on('updatePlayerList', (playerList) => {

            let filteredPlayers = playerList;

            // If the current user is the admin, remove them from the players list
            // This ensures the admin does not appear in the grouped lists
            if (role === 'admin') {
                filteredPlayers = playerList.filter(player => player.playerID !== playerID);
            }

            setPlayers(filteredPlayers);  // Update the filtered players list

            const allGroups = [];
            const nationalities = ['german', 'dutch', 'other'];
            let globalGroupNumber = 1;

            nationalities.forEach((nat) => {
                const groups = splitIntoGroups(playerList.filter(player => player.nationality === nat));
                groups.forEach((group) => {
                    allGroups.push({
                        groupNumber: globalGroupNumber++,
                        players: group,
                    });
                });
            });

            setGroupedPlayers(allGroups);
            setTotalPlayers(playerList.length - 1); // - 1 becasue we do not want to count the moderator
        });

        socket.on('playerLeftRoom', (playerIDWhoLeft) => {
            addMessage(`${playerIDWhoLeft} left the game!`);
        });

        // Cleanup listener when the component unmounts
        return () => {
            socket.off('navigateToRoom');
            socket.off('playerJoined'); // Remove the listener when the component unmounts
            socket.off('updatePlayerList');
            socket.off('playerLeftRoom');

        };
    }, [socket, role, playerID,groupedPlayers, navigate, roomId]);

    // Function to add a new message and limit the number of messages to 10
    const addMessage = (newMessage) => {
        setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, newMessage];
            return updatedMessages.length > 10 ? updatedMessages.slice(-10) : updatedMessages;
        });
    };

    useEffect(() => {
        socket.on('updateTokens', async ({ groupedPlayers }) => {
            try {
                const playerGroup = groupedPlayers.find((group) =>
                    group.players.some((player) => player.playerID === playerID)
                );

                if (playerGroup) {
                    const groupNumber = playerGroup.groupNumber;

                    // Update token for the current player
                    const updateResponse = await fetch(`${apiUrl}/api/routes/update-token-group`, {
                        method: 'POST',
                        credentials: 'include', // Include JWT cookies
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            code: roomId,
                            playerUsername: playerID,
                            nationality,
                            group: groupNumber,
                        }),
                    });

                    if (updateResponse.ok) {
                        console.log(`Token updated successfully for ${playerID}`);
                    } else {
                        const errorData = await updateResponse.json();
                        console.error(`Error updating token for ${playerID}:`, errorData.message);
                    }
                }
            } catch (error) {
                console.error(`Error updating token for ${playerID}:`, error);
            }
        });

        return () => {
            socket.off('updateTokens');
        };
    }, [socket, roomId, playerID, nationality,groupedPlayers,apiUrl]);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/cards/get-all-categories`, {
                credentials: 'include', // Include JWT cookies
            });
            if (response.ok) {
                const data = await response.json();
                setCategories(data); // Update categories state
                console.log(data)
            } else {
                console.error('Error fetching categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    const handleSaveGroups = async () => {
        if (players.length < 16) {
            setShowPopup(true);  // Show popup if there are fewer than 3 players
          return;
        }


        // Proceed with saving groups if the player count is valid
        saveGroupsData();
    };

    const saveGroupsData = async () => {
        try {

            // Prepare grouped player data
            // Prepare the data to send to the backend
            const groupedPlayersData = groupedPlayers.map((group) => ({
                groupNumber: group.groupNumber,
                players: group.players.map((player) => ({
                    name: player.playerID,
                    nationality: player.nationality,
                })),
            }));

            // Save to backend
            const response = await fetch(`${apiUrl}/api/routes/join-game-session`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, groupedPlayers: groupedPlayersData }),
            });

            if (response.ok) {
                console.log('Groups saved successfully!');
                // Emit an event to update all players' tokens
                socket.emit('updateTokens', {
                    roomId,
                    groupedPlayers,
                });

                // Send the data to the backend
                const updateResponse = await fetch(`${apiUrl}/api/routes/update-token-group`, {
                    method: 'POST',
                    credentials: 'include', // Include JWT cookies
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code: roomId,
                        playerUsername: playerID,
                        nationality,
                        role,
                        group: groupedPlayers.find((group) =>
                            group.players.some((player) => player.playerID === playerID)
                        )?.groupNumber,
                    }),
                });
                if (updateResponse.ok) {
                    const data = await updateResponse.json();
                    console.log('Token updated successfully:', data);
                } else {
                    const errorData = await updateResponse.json();
                    console.error('Error updating token:', errorData.message);
                    alert('Failed to update token.');
                }

                const groupsForRound = groupedPlayers.map((grp) => {
                    // 1) Create a frequency map of nationalities
                    const nationalityCounts = grp.players.reduce((acc, player) => {
                        acc[player.nationality] = (acc[player.nationality] || 0) + 1;
                        return acc;
                    }, {});

                    // 3) Return the group object
                    return {
                        groupNumber: grp.groupNumber,
                        categories,
                        dropZones: { priority1: [], priority2: [], priority3: [], priority4: [] },
                        messages: [],
                        nationalities: nationalityCounts,
                    };
                });

                // 5. Save these groups to your RoundOne DB
                //    (i.e. "first-round" collection)
                const roundSaveResponse = await fetch(`${apiUrl}/api/rounds/save-state-first-round`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        roomId,
                        groups: groupsForRound,
                        categories,
                    }),
                });

                const roundSaveResponse2 = await fetch(`${apiUrl}/api/rounds/save-state-second-round`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        roomId,
                        groups: groupsForRound
                    }),
                });

                // Create an empty chat room
                const chatRoomResponse = await fetch(`${apiUrl}/api/rounds/create-message-room`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        roomId,
                        groups: groupedPlayers.map((group) => ({ groupNumber: group.groupNumber }))
                    }),
                });

                if (!roundSaveResponse.ok) {
                    const errorData = await roundSaveResponse.json();
                    console.error('Error saving round data:', errorData.message);
                    alert('Failed to save round data.');
                    return;
                }

                if (!roundSaveResponse2.ok) {
                    const errorData = await roundSaveResponse2.json();
                    console.error('Error saving round data:', errorData.message);
                    alert('Failed to save round data.');
                    return;
                }


                if (!chatRoomResponse.ok) {
                    const errorData = await chatRoomResponse.json();
                    console.error('Failed to create chat room.' + errorData.message);
                    return;
                }
                console.log('Chat room created successfully!');
                console.log('Groups and round data saved successfully!');
                socket.emit('navigateToRoom', { roomId });
            } else {
                const errorData = await response.json();
                console.error('Error saving groups:', errorData.message);
            }
        } catch (error) {
            console.error('Error saving groups:', error);
        }
    };

    const onContinueAnyway = () => {
        setShowPopup(false);
        saveGroupsData();  // Continue even with fewer than 3 players
    };

    const onCancelPopup = () => {
        setShowPopup(false);
    };


    useEffect(() => {
        if (playerID && roomId) {
            socket.emit('joinSession', { playerID, nationality, gameCode: roomId });
        }

    }, [playerID, roomId, socket, nationality])

    // Function to create a new empty group manually
    const handleCreateNewGroup = () => {
        setGroupsLocked(false); // Mark groups as not locked
        const newGroupNumber = groupedPlayers.length + 1;
        setGroupedPlayers(prevGroups => [
            ...prevGroups,
            { groupNumber: newGroupNumber, players: [] }
        ]);
    };

    // Function to handle drag end event
    const onDragEnd = (result) => {
        const { destination, source } = result;
        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return; // no change in position
        }

        // Find the source group and destination group
        const sourceGroupIndex = groupedPlayers.findIndex(
            (g) => g.groupNumber.toString() === source.droppableId
        );
        const destinationGroupIndex = groupedPlayers.findIndex(
            (g) => g.groupNumber.toString() === destination.droppableId
        );

        const sourceGroup = groupedPlayers[sourceGroupIndex];
        const destinationGroup = groupedPlayers[destinationGroupIndex];

        const [movedPlayer] = sourceGroup.players.splice(source.index, 1);
        destinationGroup.players.splice(destination.index, 0, movedPlayer);

        const updatedGroups = [...groupedPlayers];
        updatedGroups[sourceGroupIndex] = sourceGroup;
        updatedGroups[destinationGroupIndex] = destinationGroup;

        setGroupedPlayers(updatedGroups);
        setGroupsLocked(false); // Mark groups as not locked
    };

    const lockInGroups = () => {
        fetchCategories()
        // Filter out empty groups
        const nonEmptyGroups = groupedPlayers.filter(
            (group) => group.players.length > 0
        );

        // Check if all groups have exactly 3 players
        const invalidGroups = nonEmptyGroups.filter(group => group.players.length < 3);


        if (invalidGroups.length > 0) {
            // Set an error message if there are invalid groups
            setCheckMessage("Some groups do not have at least 3 players. Please adjust and CHECK again!");
            setGroupsLocked(true); // Mark groups as not locked
        } else {
            setCheckMessage("Groups are good! You can continue!");

        }
        // Reassign group numbers dynamically if groups are valid
        const reindexedGroups = nonEmptyGroups.map((group, index) => ({
            ...group,
            groupNumber: index + 1, // Reassign group numbers starting from 1
        }));

        // Update the state with the cleaned-up and reordered groups
        setGroupedPlayers(reindexedGroups);
        setGroupsLocked(true); // Mark groups as locked and valid

    };

    const resetGroups = () => {
        window.location.reload()
    }


    if (loading) return <div>Loading...</div>;

    return (

        <div className='lobby-container'>
            <div className='test-layout'>
                <h1>Room ID: {roomId}</h1>

                <h2>Players in the Room:</h2>
                <div className="player-columns">
                    {/* German players */}
                    <div className="german-players">
                        <h3>German Players</h3>
                        <ul>
                            {players
                                .filter(player => player.nationality === 'german')
                                .map((player, index) => (
                                    <li key={index}>{player.playerID} ({player.nationality === 'german' ? 'de' : player.nationality})</li>
                                ))}
                        </ul>
                    </div>
                    {/* Dutch players */}
                    <div className="dutch-players">
                        <h3>Dutch Players</h3>
                        <ul>
                            {players
                                .filter(player => player.nationality === 'dutch')
                                .map((player, index) => (
                                    <li key={index}>{player.playerID} ({player.nationality === 'dutch' ? 'nl' : player.nationality})</li>
                                ))}
                        </ul>
                    </div>
                    {/* International players */}
                    <div className="international-players">
                        <h3>International Players</h3>
                        <ul>
                            {players
                                .filter(player => player.nationality === 'other')
                                .map((player, index) => (
                                    <li key={index}>{player.playerID} ({player.nationality === 'other' ? 'en' : player.nationality})</li>
                                ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Role-based layout */}
            <div className='moderator-layout'>
                {role === 'admin' ? (
                    <div className='lobby-container'>
                        <div className='test-layout'>
                            <div className='addnew-group'>
                                <h2>Groups in the Room:</h2>
                                <i class="bi bi-plus-square-fill" onClick={handleCreateNewGroup}></i>
                            </div>
                            <DragDropContext onDragEnd={onDragEnd}>
                                <div className="player-columns-moderator">
                                    {groupedPlayers.map((group) => (
                                        <Droppable droppableId={group.groupNumber.toString()} key={group.groupNumber}>
                                            {(provided) => (
                                                <div
                                                    className="player-group"
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}

                                                >
                                                    <h3>Group {group.groupNumber}</h3>
                                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                                        {group.players.map((player, index) => (
                                                            <Draggable draggableId={player.playerID} key={player.playerID} index={index}>
                                                                {(provided) => (
                                                                    <li
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        style={{
                                                                            border: '1px solid #ccc',
                                                                            padding: '8px',
                                                                            marginBottom: '8px',
                                                                            borderRadius: '4px',
                                                                            backgroundColor: '#f9f9f9',
                                                                            ...provided.draggableProps.style
                                                                        }}
                                                                    >
                                                                        {player.playerID} (
                                                                        {(() => {
                                                                            // Define the mapping of nationalities to their abbreviations
                                                                            const nationalityMap = {
                                                                                german: 'de',
                                                                                dutch: 'nl',
                                                                                other: 'en'
                                                                            };
                                                                            // Return the corresponding abbreviation for the nationality
                                                                            return nationalityMap[player.nationality] || player.nationality;
                                                                        })()}
                                                                        )
                                                                    </li>
                                                                )}
                                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </ul>
                                                </div>
                                            )}
                                        </Droppable>
                                    ))}
                                </div>
                            </DragDropContext>
                            {checkmessage && <div className={checkmessage.includes("good") ? 'success' : 'error'}>{checkmessage}</div>}

                            {role === 'admin' && (
                                <div className='lobby-admin-btns'>
                                    <button className='btn' id='reset' onClick={resetGroups}>
                                        Reset Groups
                                    </button>
                                    <button className='btn' id='lock' onClick={lockInGroups}>
                                        Check Groups
                                    </button>
                                    <button className={`btn ${groupsLocked ? 'valid' : ''}`}
                                        id='start'
                                        onClick={handleSaveGroups}
                                        disabled={!groupsLocked} // Disable if groups are not locked 
                                    >
                                        Start Game
                                    </button>

                                </div>
                            )}
                        </div>
                        <AnimatePresence>
                            {showPopup && (
                                <motion.div
                                    className="popup-overlay-lobby"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <motion.div
                                        className="popup-content-lobby"
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <h3>Not Enough Players</h3>
                                        <p>There are fewer than 16 players in the game. Are you sure you want to continue?</p>
                                        <div className="popup-buttons-lobby">
                                            <button onClick={onContinueAnyway}>Continue Anyway</button>
                                            <button onClick={onCancelPopup}>Cancel</button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (

                    <div className='container-logs'>
                        <div className='title-logs'>
                            <h2 id='title-logs-id'>Lobby log:</h2>
                            <p id='totalplayers'>Total Players Joined: <span>{totalPlayers}</span></p>
                        </div>
                        <div className='loggs'>

                            {messages.map((msg, index) => (
                                <p key={index} className='message-to-room'>{msg}</p>
                            ))}
                        </div>
                    </div>

                )}
            </div>
        </div>
    )
}

export default Lobby
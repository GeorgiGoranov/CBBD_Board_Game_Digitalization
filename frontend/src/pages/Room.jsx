import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModeratorRoomLayout from '../components/ModeratorRoomLayout';
import ParticipantRoomLayout from '../components/ParticipantRoomLayout';
import Rounds from '../components/Rounds';
import Chat from '../components/Chat';
import initSocket from '../context/socket';
import "../SCSS/room.scss"
import "../SCSS/moderatorContainerLayout.scss"

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'


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
    const [categories, setCategories] = useState([]); // State for categories
    const [dropZones, setDropZones] = useState({
        box1: [],
        box2: [],
        box3: [],
        box4: [],
    });
    const [cursorPositions, setCursorPositions] = useState({}); // State to track cursor positions
    const [userActionOccurred, setUserActionOccurred] = useState(false);
    


    if (!socketRef.current) {
        socketRef.current = initSocket();
    }

    const socket = socketRef.current;


    // Function to update cursor positions
    const updateCursorDisplay = (data) => {
        const container = document.querySelector('.room-container');
        if (container) {

            setCursorPositions((prevPositions) => ({
                ...prevPositions,
                [data.playerID]: {
                    x: data.x,
                    y: data.y
                },
            }));
        }
    };

    const handleDragDrop = (results) => {
        const { source, destination } = results;
        if (!destination) return;

        // If the item is moved within the same list and position, do nothing
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        let movedItem;

        // Remove the item from the source list
        if (source.droppableId === 'ROOT') {
            // Moving from categories list
            const updatedCategories = Array.from(categories);
            [movedItem] = updatedCategories.splice(source.index, 1); // Remove item from categories
            setCategories(updatedCategories); // Update categories without the moved item
        } else {
            // Moving from a drop zone
            const updatedSourceItems = Array.from(dropZones[source.droppableId]);
            [movedItem] = updatedSourceItems.splice(source.index, 1); // Remove item from source drop zone
            setDropZones((prev) => ({
                ...prev,
                [source.droppableId]: updatedSourceItems, // Update the specific drop zone without the moved item
            }));
        }

        // Add the item to the destination list
        if (destination.droppableId === 'ROOT') {
            setCategories((prev) => {
                const updatedCategories = Array.from(prev);
                updatedCategories.splice(destination.index, 0, movedItem); // Insert item into categories
                return updatedCategories;
            });
        } else {
            setDropZones((prev) => {
                const updatedDestinationItems = Array.from(prev[destination.droppableId]);
                updatedDestinationItems.splice(destination.index, 0, movedItem); // Insert item into destination drop zone
                return {
                    ...prev,
                    [destination.droppableId]: updatedDestinationItems,
                };
            });
        }

        // Emit the drag-drop event to the server with relevant data
        socket.emit('dragDropUpdate', { gameCode: roomId, source, destination, movedItem });
        // Indicate that a user action has occurred
        setUserActionOccurred(true);

    };

    const handleExternalDragDrop = (source, destination, movedItem) => {
        if (source.droppableId === 'ROOT') {
            setCategories((prev) => {
                const updatedCategories = Array.from(prev);
                updatedCategories.splice(source.index, 1);
                return updatedCategories;
            });
        } else {
            setDropZones((prev) => {
                const updatedSourceItems = Array.from(prev[source.droppableId]);
                updatedSourceItems.splice(source.index, 1);
                return { ...prev, [source.droppableId]: updatedSourceItems };
            });
        }

        if (destination.droppableId === 'ROOT') {
            setCategories((prev) => {
                const updatedCategories = Array.from(prev);
                updatedCategories.splice(destination.index, 0, movedItem);
                return updatedCategories;
            });
        } else {
            setDropZones((prev) => {
                const updatedDestinationItems = Array.from(prev[destination.droppableId]);
                updatedDestinationItems.splice(destination.index, 0, movedItem);
                return { ...prev, [destination.droppableId]: updatedDestinationItems };
            });
        }
    };

    const saveState = useCallback(async () => {
        try {
            const response = await fetch('/api/rounds/save-state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId, // Pass the current room ID
                    categories,
                    dropZones,
                }),
            });
            if (response.ok) {

                console.log('State saved successfully');
            }
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }, [roomId, categories, dropZones])



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
                    setRole(data.role); // Set the role (e.g. "admin" or "user")
                    setPlayerID(data.name);
                    // console.log(data.id)
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

        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/cards/get-all'); // Adjust endpoint if necessary
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data); // Update categories state
                } else {
                    console.error('Error fetching categories');
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        }

        const fetchSavedRoomState = async () => {
            try {
                const response = await fetch(`/api/rounds/get-state/${roomId}`);
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data.categories || []);
                    setDropZones(data.dropZones || { box1: [], box2: [], box3: [], box4: [] });
                    console.log('Room state loaded successfully');
                } else {
                    console.log('Room state not found');
                }
            } catch (error) {
                console.error('Error fetching room state:', error);
            }
        };

    
        if (userSessionCode != null && userSessionCode !== roomId) {
            // User is trying to access a room they haven't joined
            navigate('/duser'); // Redirect to home or show an error
        } else {
            fetchCategories()
            fetchUserRole()
            // fetchAllCards() 
            fetchSavedRoomState(); // Load the saved state

         
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

        socket.on('cursorUpdate', (data) => {
            // Handle cursor updates from other players
            updateCursorDisplay(data);
        });

        // Listen for drag-and-drop updates from other clients
        socket.on('dragDropUpdate', ({ source, destination, movedItem }) => {
            handleExternalDragDrop(source, destination, movedItem);
        });

        // Cleanup listener when the component unmounts
        return () => {
            socket.off('playerJoined'); // Remove the listener when the component unmounts
            socket.off('updatePlayerList');
            socket.off('playerLeftRoom');
            socket.off('cursorUpdate');
            socket.off('updateDragDrop');
        };
    }, [socket]);

    useEffect(() => {
        if (playerID && roomId) {
            socket.emit('joinSession', { playerID, gameCode: roomId });
        }

        const handleMouseMove = (event) => {
            const position = {
                x: event.clientX,
                y: event.clientY,
                playerID,
                gameCode: roomId,
            };
            socket.emit('cursorMove', position);
        };

        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };

    }, [playerID, roomId, socket])

    useEffect(() => {
        if (userActionOccurred) {
            saveState();
            setUserActionOccurred(false);
        }
    }, [userActionOccurred, saveState]);


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

            <h2>Competency Cards</h2>
            <div className="information-pannel">

                <div className='dragdrop-container' >


                    <DragDropContext onDragEnd={handleDragDrop}   >
                        <ul className='api-list'>
                            <Droppable droppableId='ROOT' >
                                {(provided) => (
                                    <div className='try'
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {categories.map((category, index) => {
                                            const uniqueId = `${category.category}-${index}`;

                                            return (
                                                <Draggable
                                                    draggableId={uniqueId}
                                                    key={uniqueId}
                                                    index={index}
                                                >
                                                    {(provided) => (
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            {...provided.draggableProps}
                                                            ref={provided.innerRef}
                                                        >
                                                            <li className="category-item">
                                                                {category.category}
                                                            </li>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </ul>
                        <div className="droppable-box-b">
                            {/* Render the four drop zones (boxes) */}
                            {['box1', 'box2', 'box3', 'box4'].map((box, index) => (
                                <Droppable droppableId={box} key={box} >
                                    {(provided) => (
                                        <div
                                            className="droppable-box"
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            <h2>Box {index + 1}</h2>
                                            {dropZones[box].map((item, itemIndex) => {
                                                const uniqueId = `${item.category}-${itemIndex}`;
                                                return (
                                                    <Draggable
                                                        draggableId={uniqueId}
                                                        key={uniqueId}
                                                        index={itemIndex}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="draggable-item"
                                                            >
                                                                {item.category}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}

                                            {provided.placeholder}

                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>


                    </DragDropContext>

                    {Object.entries(cursorPositions).map(([playerID, position]) => (
                        <div className='playerCursorID'
                            key={playerID}
                            style={{
                                position: 'absolute',
                                top: position.y,
                                left: position.x,
                                pointerEvents: 'none', // Make sure it doesn't interfere with interactions
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: 'rgba(0, 0, 255, 0.5)', // Customize as needed
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                zIndex: 1000,
                            }}
                        >
                            {/* Optional: display player ID */}
                            <span style={{ fontSize: '10px', color: 'red' }}>{playerID}</span>
                        </div>
                    ))}

                </div >

                <Chat playerID={playerID} socket={socket}/>
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
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModeratorRoomLayout from '../components/ModeratorRoomLayout';
import { useLanguage } from '../context/LanguageContext';
import ParticipantRoomLayout from '../components/ParticipantRoomLayout';
import Rounds from '../components/Rounds';
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
    const { language } = useLanguage(); // Access selected language
    const [cards, setCards] = useState({ competencyCard: [], otherCard: [] });
    const [userSessionCode, setUserSessionCode] = useState(null);
    const [categories, setCategories] = useState([]); // State for categories
    const [dropZones, setDropZones] = useState({
        box1: [],
        box2: [],
        box3: [],
        box4: [],
        unassigned: categories // or [] if you want it empty initially
    });



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

    const fetchAllCards = async () => {
        const [competencyCard, otherCard] = await Promise.all([
            fetch('/api/cards/competency/random').then(res => res.json()),
            fetch('/api/cards/other/random').then(res => res.json())
        ]);

        setCards({ competencyCard, otherCard });
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


    useEffect(() => {
        if (userSessionCode != null && userSessionCode !== roomId) {
            // User is trying to access a room they haven't joined
            navigate('/duser'); // Redirect to home or show an error
        } else {
            fetchCategories()
            fetchUserRole()
            // fetchAllCards() 
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

    const handleDragDrop = (results) => {
        const { source, destination } = results;
        if (!destination) return console.log(`destination not fould! + ${source} + ${destination} `);

        if (source.droppableId === destination.droppableId && source.index === destination.index)
            return console.log("same place");

        // Moving within the same list
        if (source.droppableId === destination.droppableId) {
            console.log(source.droppableId + " + " + destination.droppableId)
            if (source.droppableId === 'ROOT') {
                // Reordering categories
                const reorderedCategories = Array.from(categories);
                const [movedItem] = reorderedCategories.splice(source.index, 1);
                reorderedCategories.splice(destination.index, 0, movedItem);
                setCategories(reorderedCategories);
                console.log("tranfer")
                console.log(results)

            } else {
                // Reordering within a drop zone
                const zoneItems = Array.from(dropZones[source.droppableId]);
                const [movedItem] = zoneItems.splice(source.index, 1);
                zoneItems.splice(destination.index, 0, movedItem);
                setDropZones((prev) => ({
                    ...prev,
                    [source.droppableId]: zoneItems,
                }));
                console.log("tranfer zone")
            }
        } else {
            console.log("tranfer array")
            // Moving between different lists
            let sourceItems, destinationItems;
            if (source.droppableId === 'ROOT') {
                sourceItems = Array.from(categories);
            } else {
                sourceItems = Array.from(dropZones[source.droppableId]);
            }

            if (destination.droppableId === 'ROOT') {
                destinationItems = Array.from(categories);
            } else {
                destinationItems = Array.from(dropZones[destination.droppableId]);
            }

            const [movedItem] = sourceItems.splice(source.index, 1);
            destinationItems.splice(destination.index, 0, movedItem);

            if (source.droppableId === 'ROOT') {
                setCategories(sourceItems);
            } else {
                setDropZones((prev) => ({
                    ...prev,
                    [source.droppableId]: sourceItems,
                }));
            }

            if (destination.droppableId === 'ROOT') {
                setCategories(destinationItems);
            } else {
                setDropZones((prev) => ({
                    ...prev,
                    [destination.droppableId]: destinationItems,
                }));
            }
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

                <h2>Competency Cards</h2>

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

                </div >


                <Rounds />
            </div>
            {/* <div className="role-based-layout">
                {role === 'admin' ? (
                    <div className='moderator-container-layout'>Moderator Layout for Room {roomId}

                        <ModeratorRoomLayout />

                    </div>

                ) : (
                    <div>Player Layout for Room {roomId}
                        <ParticipantRoomLayout />
                    </div>
                )}

            </div> */}


        </div>
    )
}


export default Room
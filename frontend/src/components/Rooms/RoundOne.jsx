import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


import '../../SCSS/roundOne.scss';

const RoundOne = ({ roomId, playerID, socket, group }) => {
    const [categories, setCategories] = useState([]);
    const [dropZones, setDropZones] = useState({
        priority1: [],
        priority2: [],
        priority3: [],
        priority4: [],
    });

    const [cursorPositions, setCursorPositions] = useState({});
    const [userActionOccurred, setUserActionOccurred] = useState(false);

    const [socketMessage, setSocketMessage] = useState(''); // This can be used to display socket events

    const [socketMessageFeedback, setSocketMessageFeedback] = useState(''); // This can be used to display socket events
    const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;

    const [receivedProfile, setReceivedProfile] = useState(null);  // Add state to store the profile data




    const handleDragDrop = (results) => {
        const { source, destination } = results;
        if (!destination) return;

        // If the item is moved within the same list and position, do nothing
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        // Prevent adding to a destination that already has an item
        if (destination.droppableId !== 'ROOT' && dropZones[destination.droppableId].length > 0) {
            setSocketMessageFeedback(`All drop boxes can only hold one item!`);
            sendGroupMessage('All drop boxes can only hold one item!')
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
            setDropZones((prev) => ({
                ...prev,
                [destination.droppableId]: [movedItem], // Replace any existing item with the moved item
            }));
        }

        // Emit the drag-drop event to the server with relevant data
        socket.emit('dragDropUpdate', { gameCode: roomId, source, destination, movedItem, playerID });
        // Indicate that a user action has occurred
        setUserActionOccurred(true);

    };

    const sendGroupMessage = (message) => {
        socket.emit('sendFeedbackGroupMessage', {
            roomId,
            group, // Include the group identifier
            message,
        });
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

    // Function to update cursor positions
    const updateCursorDisplay = (data) => {

        setCursorPositions((prevPositions) => ({
            ...prevPositions,
            [data.playerID]: {
                x: data.x,
                y: data.y - 50,
                group: data.group
            },
        }));

    };

    const saveState = useCallback(async () => {
        try {
            const groups = [{
                groupNumber: group, // If you know the group number from props or context
                categories,
                dropZones,
                messages: socketMessage ? [socketMessage] : [] // put the message in the messages array
            }];

            const response = await fetch(`${apiUrl}/api/rounds/save-state-first-round`, {
                method: 'POST',
                credentials: 'include', // Include JWT cookies
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId, // Pass the current room ID
                    groups
                }),
            });
            if (response.ok) {
                console.log('State saved successfully');
            } else {
                console.error('Failed to save state');
            }
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }, [roomId, categories, dropZones, group])

    useEffect(() => {

        const fetchSavedRoomState = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/rounds/get-state-first-round/${roomId}`, {
                    credentials: 'include', // Include JWT cookies
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log(data)
                    // Convert group to a number if it's a string
                    const groupNumber = Number(group);
                    const currentGroup = data.groups?.find(g => g.groupNumber === groupNumber);

                    if (currentGroup) {
                        setCategories(currentGroup.categories || []);
                        setDropZones(currentGroup.dropZones || { priority1: [], priority2: [], priority3: [], priority4: [] });
                        // If you need to restore messages or socketMessage:
                        if (currentGroup.messages && currentGroup.messages.length > 0) {
                            setSocketMessage(currentGroup.messages[currentGroup.messages.length - 1]);
                        }
                        console.log('Room state loaded successfully');
                    } else {
                        console.log('No matching group found in room state');
                    }
                } else {
                    console.log('Room state not found');
                }
            } catch (error) {
                console.error('Error fetching room state:', error);
            }
        };

        if (group) {
            // fetchCategories();
            fetchSavedRoomState();
        }
    }, [roomId, group])

    useEffect(() => {
        socket.on('cursorUpdate', (data) => {
            // Handle cursor updates from other players
            updateCursorDisplay(data);

        });

        // Listen for drag-and-drop updates from other clients
        socket.on('dragDropUpdate', ({ source, destination, movedItem, playerID: senderID }) => {
            // Ignore the update if it came from the same player who performed the drag locally
            if (senderID !== playerID) {
                handleExternalDragDrop(source, destination, movedItem);
            }
        });

        // Listen for group messages
        socket.on('receiveGroupMessage', ({ message }) => {

            // Only the targeted group members will get this
            console.log("Group message received:", message);
            // You can display it in the UI as needed
            setSocketMessage(`${message}`);
        });

        socket.on('receiveFeedbackGroupMessage', ({ message }) => {
            setSocketMessageFeedback(message); // Display the received message
        });
        socket.on('receiveProfileData', (data) => {
            console.log('Received profile data:', data);
            setReceivedProfile(data);  // Store the received profile data
        });

        return () => {
            socket.off('cursorUpdate');
            socket.off('dragDropUpdate');
            socket.off('receiveGroupMessage');
            socket.off('receiveFeedbackGroupMessage');
            socket.off('receiveProfileData');  // Clean up the listener on unmount
        }
    }, [socket])

    useEffect(() => {

        const handleMouseMove = (event) => {
            const position = {
                x: event.clientX,
                y: event.clientY,
                playerID,
                gameCode: roomId,
                group
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

    return (
        <div className='round-one-container'>
            {socketMessage && <p>{socketMessage}</p>}

            {receivedProfile && (
                <div className='profile-display'>
                    <h2>Profile:</h2>
                    <h3>{receivedProfile.profileName}</h3>
                    <p>{receivedProfile.profileDesc}</p>

                </div>
            )}

            <div className='dragdrop-container-1' >
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
                        {['priority1', 'priority2', 'priority3', 'priority4'].map((box, index) => (
                            <Droppable droppableId={box} key={box} >
                                {(provided, snapshot) => (
                                    <div
                                        className="droppable-box"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        <h2 className='box-text'># {index + 1}</h2>
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
                <div className='feedback-box-round-1'>

                    {socketMessageFeedback && <div className='error' >{socketMessageFeedback}</div>}
                </div>

                {Object.entries(cursorPositions)
                    .filter(([pid, pos]) => pos.group === group)
                    .map(([playerID, position]) => (
                        <div className='playerCursorID'
                            key={playerID}
                            style={{
                                position: 'absolute',
                                top: position.y,
                                left: position.x,
                                pointerEvents: 'none',
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: 'rgba(0, 0, 255, 0.5)',
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                zIndex: 1000,
                            }}>
                            <span style={{ fontSize: '10px', color: 'red' }}>{playerID}</span>
                        </div>
                    ))}


            </div >
        </div>
    )
}

export default RoundOne
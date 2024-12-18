import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


import '../../SCSS/roundOne.scss';

const RoundOne = ({ roomId, playerID, socket, group }) => {
    const [categories, setCategories] = useState([]);
    const [dropZones, setDropZones] = useState({
        box1: [],
        box2: [],
        box3: [],
        box4: [],
    });

    const [cursorPositions, setCursorPositions] = useState({});
    const [userActionOccurred, setUserActionOccurred] = useState(false);

    const [socketMessage, setSocketMessage] = useState(''); // This can be used to display socket events


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
        socket.emit('dragDropUpdate', { gameCode: roomId, source, destination, movedItem, playerID });
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

    // Function to update cursor positions
    const updateCursorDisplay = (data) => {

        setCursorPositions((prevPositions) => ({
            ...prevPositions,
            [data.playerID]: {
                x: data.x ,
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
            console.log(socketMessage)

            const response = await fetch('/api/rounds/save-state-first-round', {
                method: 'POST',
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
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/cards/get-all-categories');
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
                const response = await fetch(`/api/rounds/get-state-first-round/${roomId}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(data)
                    // Convert group to a number if it's a string
                    const groupNumber = Number(group);
                    const currentGroup = data.groups?.find(g => g.groupNumber === groupNumber);

                    if (currentGroup) {
                        setCategories(currentGroup.categories || []);
                        setDropZones(currentGroup.dropZones || { box1: [], box2: [], box3: [], box4: [] });
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
            fetchCategories();
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

        return () => {
            socket.off('cursorUpdate');
            socket.off('dragDropUpdate');
            socket.off('receiveGroupMessage');
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
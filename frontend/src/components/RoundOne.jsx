import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import '../SCSS/roundOne.scss';

const RoundOne = ({ roomId, playerID, socket }) => {
    const [categories, setCategories] = useState([]);
    const [dropZones, setDropZones] = useState({
        box1: [],
        box2: [],
        box3: [],
        box4: [],
    });

    const [cursorPositions, setCursorPositions] = useState({});
    const [userActionOccurred, setUserActionOccurred] = useState(false);


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

        fetchCategories();
        fetchSavedRoomState();
    }, [roomId])

    useEffect(() => {
        socket.on('cursorUpdate', (data) => {
            // Handle cursor updates from other players
            updateCursorDisplay(data);
        });

        // Listen for drag-and-drop updates from other clients
        socket.on('dragDropUpdate', ({ source, destination, movedItem }) => {
            handleExternalDragDrop(source, destination, movedItem);
        });

        return () => {
            socket.off('cursorUpdate');
            socket.off('dragDropUpdate');
        }
    }, [socket])

    useEffect(() => {

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

    return (
        <div className='round-one-container'>
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
        </div>
    )
}

export default RoundOne
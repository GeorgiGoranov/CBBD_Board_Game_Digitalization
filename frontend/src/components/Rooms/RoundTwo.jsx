import {
    DragDropContext,
    Droppable,
    Draggable,
} from 'react-beautiful-dnd';
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import '../../SCSS/roundTwo.scss';


const RoundTwo = ({ roomId, playerID, socket, group, availableGroups }) => {
    const { language } = useLanguage(); // Access selected language
    const [categoriesData, setCategoriesData] = useState([]);
    const [collapsedCategories, setCollapsedCategories] = useState({});

    const [currentGroupIndex, setCurrentGroupIndex] = useState(0); // Track the current group


    const [dropZones, setDropZones] = useState({
        priority1: [],
        priority2: [],
        priority3: [],
        priority4: [],

    });
    const [dropZonesInit, setDropZonesInit] = useState({
        priority5: [],
        priority6: [],
        priority7: [],
        priority8: [],

    });

    const boxMessages = {
        en: {
            priority1: "Competencies (max. 5)",
            priority2: "Skills (max. 5)",
            priority3: "Education (max. 2)",
            priority4: "Experience (max. 2)",
        },
        nl: {
            priority1: "Competenties (max. 5)",
            priority2: "Vaardigheden (max. 5)",
            priority3: "Opleiding (max. 2)",
            priority4: "Ervaring (max. 2)",
        },
        de: {
            priority1: "Kompetenzen (max. 5)",
            priority2: "Fähigkeiten (max. 5)",
            priority3: "Bildung (max. 2)",
            priority4: "Erfahrung (max. 2)",
        },
    };


    const [cursorPositions, setCursorPositions] = useState({});
    const [userActionOccurred, setUserActionOccurred] = useState(false);

    const [socketMessage, setSocketMessage] = useState(''); // This can be used to display socket events
    const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;


    const toggleCategoryCollapse = (categoryName) => {
        setCollapsedCategories((prevState) => ({
            ...prevState,
            [categoryName]: !prevState[categoryName],
        }));
    };

    // Unique ID generator
    const generateUniqueId = (() => {
        let counter = 0;
        return (playerID) => {
            counter += 1;
            return `${playerID}-${Date.now()}-${counter}`;
        };
    })();


    const handleDragDrop = (results) => {
        const { source, destination } = results;
        if (!destination) return;

        const sourceDroppableId = source.droppableId;
        const destinationDroppableId = destination.droppableId;

        const sourceIsCategory = sourceDroppableId.startsWith('category-');
        const destinationIsCategory = destinationDroppableId.startsWith('category-');

        if (sourceIsCategory && destinationIsCategory) {
            return;
        }

        let movedItem;

        if (sourceIsCategory) {
            // Get the item from categories
            const category = categoriesData.find(
                (cat) => `category-${cat.category}` === sourceDroppableId
            );
            if (category) {
                const originalItem = category.options[source.index];
                // Create a new item with a unique ID
                movedItem = {
                    ...originalItem,
                    id: generateUniqueId(playerID),
                };
            }
        } else {
            // Remove the item from the drop zone
            const updatedSourceItems = Array.from(dropZones[sourceDroppableId]);
            [movedItem] = updatedSourceItems.splice(source.index, 1);
            setDropZones((prev) => ({
                ...prev,
                [sourceDroppableId]: updatedSourceItems,
            }));
        }

        if (destinationIsCategory) {
            // Item is being removed from drop zone; no action needed
        } else {
            setDropZones((prev) => {
                const updatedDestinationItems = Array.from(prev[destinationDroppableId]);
                updatedDestinationItems.splice(destination.index, 0, movedItem);
                return { ...prev, [destinationDroppableId]: updatedDestinationItems };
            });
        }

        // Emit the drag-drop event to the server with relevant data
        socket.emit('dragDropUpdate', {
            gameCode: roomId,
            source,
            destination,
            movedItem,
            playerID
        });
        setUserActionOccurred(true);
    };

    const handleExternalDragDrop = (source, destination, movedItem) => {
        const sourceDroppableId = source.droppableId;
        const destinationDroppableId = destination.droppableId;

        const sourceIsCategory = sourceDroppableId.startsWith('category-');
        const destinationIsCategory = destinationDroppableId.startsWith('category-');

        if (!sourceIsCategory) {
            // Remove the item from the source drop zone
            setDropZones((prev) => {
                const updatedSourceItems = Array.from(prev[sourceDroppableId]);
                const itemIndex = updatedSourceItems.findIndex((item) => item.id === movedItem.id);
                if (itemIndex !== -1) {
                    updatedSourceItems.splice(itemIndex, 1);
                    return { ...prev, [sourceDroppableId]: updatedSourceItems };
                }
                return prev;
            });
        }

        if (!destinationIsCategory) {
            // Add the item to the destination drop zone
            setDropZones((prev) => {
                const updatedDestinationItems = Array.from(prev[destinationDroppableId]);
                updatedDestinationItems.splice(destination.index, 0, movedItem);
                return { ...prev, [destinationDroppableId]: updatedDestinationItems };
            });
        } else {
            // If needed, handle the case where the item moves back to categories 
            // If you allow that scenario, you'd replicate what you do in handleDragDrop for categories
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
            // Construct groups array similar to RoundOne
            const groups = [{
                groupNumber: group, // If you know the group number from props or context
                dropZones,
                messages: socketMessage ? [socketMessage] : [] // put the message in the messages array

            }];
            const response = await fetch(`${apiUrl}/api/rounds/save-state-second-round`, {
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
            }
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }, [roomId, dropZones])



    useEffect(() => {
        const fetchSavedRoomStateMessage = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/rounds/get-state-first-round/${roomId}`, {
                    credentials: 'include', // Include JWT cookies
                });
                if (response.ok) {
                    const data = await response.json();
                    // Convert group to a number if it's a string
                    const groupNumber = Number(group);
                    const currentGroup = data.groups?.find(g => g.groupNumber === groupNumber);

                    if (currentGroup) {
                        // If you need to restore messages or socketMessage:
                        if (currentGroup.messages && currentGroup.messages.length > 0) {
                            setSocketMessage(currentGroup.messages[currentGroup.messages.length - 1]);
                        }
                        console.log('Room state Message loaded successfully');
                    } else {
                        console.log('No matching group message found in room state');
                    }
                } else {
                    console.log('Room state not found');
                }
            } catch (error) {
                console.error('Error fetching room state:', error);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/cards/get-all-cards`, {
                    credentials: 'include', // Include JWT cookies
                });
                if (response.ok) {
                    const data = await response.json();

                    // Process data into categories with options
                    const processedData = data.map((category, categoryIndex) => ({
                        category: category.category,
                        options: category.subcategories.map((subcategory, subIndex) => {
                            // Handle undefined subcategory.name
                            const subcategoryName = subcategory.name || `undefined-name-${subIndex}`;

                            // Log a warning if subcategory.name is undefined
                            if (!subcategory.name) {
                                console.warn(
                                    `Warning: subcategory.name is undefined for category ${category.category} at index ${subIndex}`
                                );
                            }

                            return {
                                id: `option-${category.category}-${subcategoryName}-${subIndex}`,
                                text: subcategory.options[language] || subcategoryName,
                                category: category.category,
                            };
                        }),
                    }));
                    setCategoriesData(processedData);

                    // Initialize collapsedCategories state
                    const initialCollapsedState = {};
                    data.forEach((category) => {
                        initialCollapsedState[category.category] = true; // All categories expanded by default
                    });
                    setCollapsedCategories(initialCollapsedState);
                } else {
                    console.error('Error fetching categories');
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };



        const fetchSavedRoomState = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/rounds/get-state-second-round/${roomId}`, {
                    credentials: 'include', // Include JWT cookies
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log(data)
                    // Convert group to a number if it's a string
                    const groupNumber = Number(group);
                    const currentGroup = data.groups?.find(g => g.groupNumber === groupNumber);

                    if (currentGroup) {
                        // Do NOT set categoriesData here since we have no categories in the saved state
                        // setCategoriesData(currentGroup.categories || []);

                        setDropZones(currentGroup.dropZones || {
                            priority1: [],
                            priority2: [],
                            priority3: [],
                            priority4: []
                        });

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
            fetchSavedRoomStateMessage();
            fetchCategories();
            fetchSavedRoomState();
        }
    }, [roomId, language, group]);

    useEffect(() => {
        // Listen for drag-and-drop updates from other clients
        socket.on('dragDropUpdate', ({ source, destination, movedItem, playerID: senderID }) => {
            // Ignore the update if it came from the same player who performed the drag locally
            if (senderID !== playerID) {
                handleExternalDragDrop(source, destination, movedItem);
            }
        });

        socket.on('cursorUpdate', (data) => {
            // Handle cursor updates from other players
            updateCursorDisplay(data);
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
        };
    }, [socket]);

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

    useEffect(() => {
        // Fetch data for the current group
        const fetchGroupDataRoundOne = async () => {

            // const currentGroupNumber = availableGroups[currentGroupIndex];
            try {
                const response = await fetch(`${apiUrl}/api/rounds/get-state-first-round/${roomId}`, {
                    credentials: 'include', // Include JWT cookies
                });
                if (response.ok) {
                    const data = await response.json();

                    // Find the group data for the current group
                    const matchingGroup = data.groups.find(
                        (g) => String(g.groupNumber).trim() === String(group).trim()
                    );

                    if (matchingGroup) {
                        const renamedDropZones = {
                            priority5: matchingGroup.dropZones.priority1 || [],
                            priority6: matchingGroup.dropZones.priority2 || [],
                            priority7: matchingGroup.dropZones.priority3 || [],
                            priority8: matchingGroup.dropZones.priority4 || [],
                        };
                        setDropZonesInit(renamedDropZones);
                    } else {
                        console.log('No matching group found.');
                        setDropZonesInit({ priority5: [], priority6: [], priority7: [], priority8: [] });
                    }
                } else {
                    console.error('Failed to fetch group data');
                }
            } catch (error) {
                console.error('Error fetching group data:', error);
            }
        }


        fetchGroupDataRoundOne();

    }, [group, roomId, apiUrl]);



    return (
        <div className='container-layout-roun2'>
            <div className="first-round-choices">
                {availableGroups.length > 0 ? (
                    <>
                        <div className="group-decisions-round2">
                            <h2>Decisions from Round 1</h2>
                            <div className='priority-boxes-round2'>

                                {['priority5', 'priority6', 'priority7', 'priority8'].map((priority, index) => (
                                    <div className="droppable-box" key={priority}>
                                        <h2 className="box-text">Priority {index + 5}</h2>
                                        {dropZonesInit[priority] && dropZonesInit[priority].length > 0 ? (
                                            dropZonesInit[priority].map((item, itemIndex) => (
                                                <div key={`${item.category}-${itemIndex}`} className="draggable-item">
                                                    {item.category}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="empty-box">No items in this priority.</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <p>No groups available for discussion.</p>
                )}
            </div>


            <div>


                {socketMessage && <p>{socketMessage}</p>}
                <DragDropContext onDragEnd={handleDragDrop}>
                    <ul className="api-list categories-grid">
                        {/* Iterate over categories */}
                        {categoriesData.map((category, categoryIndex) => (
                            <div key={`category-${categoryIndex}`} className="category-container">
                                <h2
                                    onClick={() => toggleCategoryCollapse(category.category)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {category.category}
                                </h2>
                                {!collapsedCategories[category.category] && (
                                    <Droppable droppableId={`category-${category.category}`}>
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="options-container"
                                            >
                                                {category.options.map((option, index) => (
                                                    <Draggable
                                                        draggableId={`category-${option.id}`}
                                                        key={`category-${option.id}`}
                                                        index={index}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="option-item"
                                                            >
                                                                <p>{option.text}</p>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                )}
                            </div>
                        ))}
                    </ul>

                    <div className="droppable-box-b">
                        {['priority1', 'priority2', 'priority3', 'priority4'].map((box, index) => (
                            <Droppable droppableId={box} key={box}>
                                {(provided) => (
                                    <div
                                        className="droppable-box"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        <div className='box-description'>
                                            <h2># {index + 1}</h2>
                                            <h6>{boxMessages[language][box]}</h6>
                                        </div>



                                        {dropZones[box].map((item, itemIndex) => (
                                            <Draggable
                                                draggableId={item.id}
                                                key={item.id}
                                                index={itemIndex}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="draggable-item"
                                                    >
                                                        {item.text}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
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

            </div>
        </div>
    );
};

export default RoundTwo;

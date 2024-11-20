import {
    DragDropContext,
    Droppable,
    Draggable,
} from 'react-beautiful-dnd';
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import '../SCSS/roundTwo.scss';


const RoundTwo = ({ roomId, playerID, socket }) => {
    const { language } = useLanguage(); // Access selected language
    const [categoriesData, setCategoriesData] = useState([]);
    const [collapsedCategories, setCollapsedCategories] = useState({});
    const [dropZones, setDropZones] = useState({
        box1: [],
        box2: [],
        box3: [],
        box4: [],
    });
    const [cursorPositions, setCursorPositions] = useState({});
    const [userActionOccurred, setUserActionOccurred] = useState(false);


    const toggleCategoryCollapse = (categoryName) => {
        setCollapsedCategories((prevState) => ({
            ...prevState,
            [categoryName]: !prevState[categoryName],
        }));
    };

    const handleDragDrop = (results) => {
        const { source, destination } = results;
        if (!destination) return;

        const sourceDroppableId = source.droppableId;
        const destinationDroppableId = destination.droppableId;

        const sourceIsCategory = sourceDroppableId.startsWith('category-');
        const destinationIsCategory = destinationDroppableId.startsWith('category-');

        const sourceIsDropZone = sourceDroppableId.startsWith('box');
        const destinationIsDropZone = destinationDroppableId.startsWith('box');

        // Prevent moving items within the same category
        if (
            sourceIsCategory &&
            destinationIsCategory &&
            sourceDroppableId === destinationDroppableId
        ) {
            // The item is being dragged within the same category
            // Do nothing
            return;
        }
        // Prevent moving items between different categories
        if (
            sourceIsCategory &&
            destinationIsCategory &&
            sourceDroppableId !== destinationDroppableId
        ) {
            return;
        }

        // Prevent moving items from drop zone to different category than original
        if (
            sourceIsDropZone &&
            destinationIsCategory
        ) {
            // Get the moved item
            let movedItem = dropZones[sourceDroppableId][source.index];
            // Check if the item's category matches the destination category
            const itemOriginalCategoryId = `category-${movedItem.category}`;
            if (destinationDroppableId !== itemOriginalCategoryId) {
                // Prevent moving item back to a different category
                return;
            }
        }

        // Prevent moving items between drop zones
        // if (
        //     sourceIsDropZone &&
        //     destinationIsDropZone &&
        //     sourceDroppableId !== destinationDroppableId
        // ) {
        //     return;
        // }

        let movedItem;

        // Remove the item from the source list
        if (sourceIsCategory) {
            // Remove from the category's options
            const updatedCategories = categoriesData.map((category) => {
                if (`category-${category.category}` === sourceDroppableId) {
                    const updatedOptions = Array.from(category.options);
                    [movedItem] = updatedOptions.splice(source.index, 1);
                    return { ...category, options: updatedOptions };
                }
                return category;
            });
            setCategoriesData(updatedCategories);
        } else {
            // Remove from drop zone
            const updatedSourceItems = Array.from(dropZones[sourceDroppableId]);
            [movedItem] = updatedSourceItems.splice(source.index, 1);
            setDropZones((prev) => ({
                ...prev,
                [sourceDroppableId]: updatedSourceItems,
            }));
        }

        // Add the item to the destination list
        if (destinationIsCategory) {
            // Add back to the category's options
            const updatedCategories = categoriesData.map((category) => {
                if (`category-${category.category}` === destinationDroppableId) {
                    const updatedOptions = Array.from(category.options);
                    updatedOptions.splice(destination.index, 0, movedItem);
                    return { ...category, options: updatedOptions };
                }
                return category;
            });
            setCategoriesData(updatedCategories);
        } else {
            // Add to drop zone
            const updatedDestinationItems = Array.from(dropZones[destinationDroppableId]);
            updatedDestinationItems.splice(destination.index, 0, movedItem);
            setDropZones((prev) => ({
                ...prev,
                [destinationDroppableId]: updatedDestinationItems,
            }));
        }

        // Emit the drag-drop event to the server with relevant data
        socket.emit('dragDropUpdate', {
            gameCode: roomId,
            source,
            destination,
            movedItem,
        });
        setUserActionOccurred(true);
    };

    const handleExternalDragDrop = (source, destination, movedItem) => {
        const sourceDroppableId = source.droppableId;
        const destinationDroppableId = destination.droppableId;

        const sourceIsCategory = sourceDroppableId.startsWith('category-');
        const destinationIsCategory = destinationDroppableId.startsWith('category-');

        const sourceIsDropZone = sourceDroppableId.startsWith('box');
        const destinationIsDropZone = destinationDroppableId.startsWith('box');

        // Remove the item from the source list
        if (sourceIsCategory) {
            // Remove from the category's options
            setCategoriesData((prevCategories) =>
                prevCategories.map((category) => {
                    if (`category-${category.category}` === sourceDroppableId) {
                        const updatedOptions = Array.from(category.options);
                        updatedOptions.splice(source.index, 1);
                        return { ...category, options: updatedOptions };
                    }
                    return category;
                })
            );
        } else {
            // Remove from drop zone
            setDropZones((prevDropZones) => {
                const updatedSourceItems = Array.from(prevDropZones[sourceDroppableId]);
                updatedSourceItems.splice(source.index, 1);
                return { ...prevDropZones, [sourceDroppableId]: updatedSourceItems };
            });
        }

        // Add the item to the destination list
        if (destinationIsCategory) {
            // Add back to the category's options
            setCategoriesData((prevCategories) =>
                prevCategories.map((category) => {
                    if (`category-${category.category}` === destinationDroppableId) {
                        const updatedOptions = Array.from(category.options);
                        updatedOptions.splice(destination.index, 0, movedItem);
                        return { ...category, options: updatedOptions };
                    }
                    return category;
                })
            );
        } else {
            // Add to drop zone
            setDropZones((prevDropZones) => {
                const updatedDestinationItems = Array.from(prevDropZones[destinationDroppableId]);
                updatedDestinationItems.splice(destination.index, 0, movedItem);
                return { ...prevDropZones, [destinationDroppableId]: updatedDestinationItems };
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
            const response = await fetch('/api/rounds/save-state-second-round', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId, // Pass the current room ID
                    categoriesData,
                    dropZones,
                }),
            });
            if (response.ok) {
                console.log('State saved successfully');
            }
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }, [roomId, categoriesData, dropZones])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/cards/get-all-cards');
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
                const response = await fetch(`/api/rounds/get-state-second-round/${roomId}`);
                if (response.ok) {
                    const data = await response.json();
                    setCategoriesData(data.categories || []);
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
    }, [roomId, language]);

    useEffect(() => {
        // Listen for drag-and-drop updates from other clients
        socket.on('dragDropUpdate', ({ source, destination, movedItem }) => {
            handleExternalDragDrop(source, destination, movedItem);
        });

        socket.on('cursorUpdate', (data) => {
            // Handle cursor updates from other players
            updateCursorDisplay(data);
        });

        return () => {
            socket.off('cursorUpdate');
            socket.off('dragDropUpdate');
        };
    }, [socket]);

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
        <div>
            <DragDropContext onDragEnd={handleDragDrop}>
                <ul className="api-list categories-grid">
                    {/* Iterate over categories */console.log(categoriesData)}
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
                                                    draggableId={option.id}
                                                    key={option.id}
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
                    {['box1', 'box2', 'box3', 'box4'].map((box, index) => (
                        <Droppable droppableId={box} key={box}>
                            {(provided) => (
                                <div
                                    className="droppable-box"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <h2>Box {index + 1}</h2>
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
        </div>
    );
};

export default RoundTwo;

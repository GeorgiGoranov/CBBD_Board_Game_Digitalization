import React, { useState, useEffect } from 'react';
import "../../SCSS/groupDiscussions.scss"


const GroupDiscussion = ({ roomId, apiUrl, availableGroups, socket, playerID, role, currentRound }) => {

    const [currentGroupIndex, setCurrentGroupIndex] = useState(0); // Track the current group
    const [groupData, setGroupData] = useState(null); // Data for the current group

    const [dropZones, setDropZones] = useState({
        priority1: [],
        priority2: [],
        priority3: [],
        priority4: [],
    });
    const [receivedProfile, setReceivedProfile] = useState(null);  // Add state to store the profile data




    useEffect(() => {

        // Fetch data for the current group
        const fetchGroupDataRoundOne = async () => {
            if (availableGroups.length > 0) {
                const currentGroupNumber = availableGroups[currentGroupIndex];
                try {
                    const response = await fetch(`${apiUrl}/api/rounds/get-state-first-round/${roomId}`, {
                        credentials: 'include', // Include JWT cookies
                    });
                    if (response.ok) {
                        const data = await response.json();
                        // Find the group data for the current group
                        const matchingGroup = data.groups.find(
                            (g) => String(g.groupNumber).trim() === String(currentGroupNumber).trim()
                        );

                   
                        if (matchingGroup) {
                            setGroupData(matchingGroup);
                            setDropZones(matchingGroup.dropZones || { priority1: [], priority2: [], priority3: [], priority4: [] });

                            if (matchingGroup.messages && matchingGroup.messages.length > 0) {
                                const lastMessage = matchingGroup.messages[matchingGroup.messages.length - 1];

                                // Update the state to store the profile data exactly as received from the backend
                                setReceivedProfile(lastMessage);
                            }
                        } else {
                          
                            setGroupData(null);
                            setDropZones({ priority1: [], priority2: [], priority3: [], priority4: [] });
                        }
                    } else {
                        console.error('Failed to fetch group data');
                    }
                } catch (error) {
                    console.error('Error fetching group data:', error);
                }
            }
        };

        const fetchGroupDataRoundTwo = async () => {
            if (availableGroups.length > 0) {
                const currentGroupNumber = availableGroups[currentGroupIndex];
                try {
                    const response = await fetch(`${apiUrl}/api/rounds/get-state-second-round/${roomId}`, {
                        credentials: 'include', // Include JWT cookies
                    });
                    if (response.ok) {
                        const data = await response.json();
                        // Find the group data for the current group
                        const matchingGroup = data.groups.find(
                            (g) => String(g.groupNumber).trim() === String(currentGroupNumber).trim()
                        );

                      
                        if (matchingGroup) {
                            setGroupData(matchingGroup);
                            setDropZones(matchingGroup.dropZones || { priority1: [], priority2: [], priority3: [], priority4: [] });

                            if (matchingGroup.messages && matchingGroup.messages.length > 0) {
                                const lastMessage = matchingGroup.messages[matchingGroup.messages.length - 1];

                                // Update the state to store the profile data exactly as received from the backend
                                setReceivedProfile(lastMessage);
                            }
                        } else {
                            setGroupData(null);
                            setDropZones({ priority1: [], priority2: [], priority3: [], priority4: [] });
                        }
                    } else {
                        console.error('Failed to fetch group data');
                    }
                } catch (error) {
                    console.error('Error fetching group data:', error);
                }
            }
        };


        if (currentRound === 1) {
            fetchGroupDataRoundOne();
        }

        if (currentRound === 2) {
            fetchGroupDataRoundTwo();
        }


    }, [currentGroupIndex, availableGroups, roomId, apiUrl]);

    // Handle receiving group change via socket
    useEffect(() => {
        if (socket) {
            const handleNextGroupUnderDiscussion = (newGroupNumber) => {
             
                const newIndex = availableGroups.findIndex(
                    (g) => String(g).trim() === String(newGroupNumber).trim()
                );
                if (newIndex !== -1) {
                    setCurrentGroupIndex(newIndex);
                } else {
                    console.warn(`Received group number ${newGroupNumber} not found in availableGroups.`);
                }
            };

            socket.on('nextGroupUnderDiscussion', handleNextGroupUnderDiscussion);

            // Cleanup on unmount
            return () => {
                socket.off('nextGroupUnderDiscussion', handleNextGroupUnderDiscussion);
            };
        }
    }, [socket, availableGroups]);

    // Optional: Emit group change events when a user navigates groups
    const emitGroupChange = (newGroupNumber) => {
        if (socket) {
            socket.emit('groupChange', newGroupNumber);
        }
    };

    const handleNextGroup = () => {
        setCurrentGroupIndex((prevIndex) => {
            const newIndex = (prevIndex + 1) % availableGroups.length;
            const newGroupNumber = availableGroups[newIndex];
            emitGroupChange(newGroupNumber); // Broadcast the change
            return newIndex;
        });
    };

    const handlePreviousGroup = () => {
        setCurrentGroupIndex((prevIndex) => {
            const newIndex = prevIndex === 0 ? availableGroups.length - 1 : prevIndex - 1;
            const newGroupNumber = availableGroups[newIndex];
            emitGroupChange(newGroupNumber); // Broadcast the change
            return newIndex;
        });
    };

    // if (loading) return <div>Loading...</div>;

    return (
        <div className='container-whole-class-discussion'>
            <div className="group-discussion-container">
                <h2>Group Discussion</h2>
                {availableGroups.length > 0 ? (
                    <>
                        <div className="group-decisions">
                            <h2>Decisions for Group {availableGroups[currentGroupIndex]}</h2>
                            {receivedProfile && (
                                <div className='profile-display'>
                                    <h2>Profile: {receivedProfile.profile.name}</h2>

                                    <p>{receivedProfile.profile.options?.en || 'Description not available'}</p>


                                </div>
                            )}
                            <div className='priority-boxes'>

                                {['priority1', 'priority2', 'priority3', 'priority4'].map((priority, index) => (
                                    <div className="droppable-box" key={priority}>
                                        <h2 className="box-text">Priority {index + 1}</h2>
                                        {dropZones[priority] && dropZones[priority].length > 0 ? (
                                            dropZones[priority].map((item, itemIndex) => (
                                                <div key={`${item.category}-${itemIndex}`} className="draggable-item">
                                                    {currentRound === 1 ? (
                                                        item.category
                                                    ) : (
                                                        item.text || 'Unnamed Option'
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="empty-box">No items in this priority.</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {role === 'admin' ? (
                                <div className="group-navigation">
                                    <i class="bi bi-caret-left-fill" onClick={handlePreviousGroup}></i>
                                    <h3>Current Group: {availableGroups[currentGroupIndex]}</h3>
                                    <i class="bi bi-caret-right-fill" onClick={handleNextGroup}></i>
                                </div>

                            ) : (
                                ""
                            )}
                        </div>
                    </>
                ) : (
                    <p>No groups available for discussion.</p>
                )}
            </div>
        </div>
    );
}

export default GroupDiscussion
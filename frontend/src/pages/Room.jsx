import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModeratorRoomLayout from '../components/Moderator/ModeratorRoomLayout';
import ParticipantRoomLayout from '../components/ParticipantRoomLayout';
import "../SCSS/room.scss"

import Chat from '../components/Rooms/Chat';
import RoundOne from '../components/Rooms/RoundOne';
import RoundTwo from '../components/Rooms/RoundTwo';
import RoundThree from '../components/Rooms/RoundThree';
import GroupDiscussion from '../components/Rooms/GroupDiscussion';
import CreateNewProfiles from '../components/Moderator/CreateNewProfiles';
import { motion, AnimatePresence } from 'framer-motion';
import { SocketContext } from '../context/SocketContext';


const Room = () => {
    const { roomId } = useParams(); // Fetch roomId from the URL
    const [playerID, setPlayerID] = useState('');
    const [message, setMessage] = useState('');

    const socket = useContext(SocketContext); // Access the same socket instance


    const [players, setPlayers] = useState([]);
    const [role, setRole] = useState(null); // Role state to determine layout
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()
    const [userSessionCode, setUserSessionCode] = useState(null);
    const [currentRound, setCurrentRound] = useState(0); // Start at round 0
    const [group, setGroup] = useState('');
    const [showGroupDiscussion, setShowGroupDiscussion] = useState(false); // New state

    const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;
    const [nationality, setNationality] = useState('')

    const [availableGroups, setAvailableGroups] = useState([]); // Unique group numbers
    const [selectedGroups, setSelectedGroups] = useState([]); // Selected groups via checkboxes
    const [selectedProfile, setSelectedProfile] = useState(null);

    const [groupReadiness, setGroupReadiness] = useState({});

    const [showMessage, setShowMessage] = useState(!!message);

    const [isOverlayVisible, setIsOverlayVisible] = useState(false);

    const [roundAnim, setRoundAnim] = useState(currentRound); // for animation purposes 




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
        if (message) {
            setShowMessage(true);


            // Set a timer to hide the message after 5 seconds
            const timer = setTimeout(() => {
                setShowMessage(false);
            }, 5000);

            // Cleanup the timer when component unmounts or message changes
            return () => clearTimeout(timer);
        }
    }, [message]);

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
    }, [userSessionCode, navigate, roomId, apiUrl])

    useEffect(() => {

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
           
            // Reset readiness for all groups whenever a round changes:
            setGroupReadiness({});
            setIsOverlayVisible(false);
        });

        socket.on('gameStopped', () => {
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

        socket.on('groupFullyReady', ({ groupNumber }) => {
            setGroupReadiness(prev => ({
                ...prev,
                [groupNumber]: {
                    ...prev[groupNumber],
                    isFullyReady: true,
                }
            }));
        });

        socket.on('groupReadinessUpdate', ({ groupNumber, readyCount, totalCount }) => {
            setGroupReadiness(prev => ({
                ...prev,
                [groupNumber]: {
                    isFullyReady: false,
                    readyCount,
                    totalCount
                }
            }));
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
            socket.off('groupFullyReady');
            socket.off('groupReadinessUpdate');
        };
    }, [socket, role, navigate]);

    useEffect(() => {
        if (playerID && roomId) {
            socket.emit('joinSession', { playerID, gameCode: roomId, group: String(group) });
        }

    }, [playerID, roomId, socket, group])



    const handleProfileSelect = (profile) => {
        setSelectedProfile(profile);
    };

    // Send the selected profile to the selected groups
    const handleSendProfileToGroups = () => {
        if (!selectedProfile || selectedGroups.length === 0) {
            alert('Please select a profile and at least one group.');
            return;
        }

        // Emit a socket event to send the profile to the groups
        socket.emit('sendProfileToGroups', {
            roomId,
            profile: selectedProfile,
            groups: selectedGroups
        });

        socket.emit('setSelectedProfileToNull', {});

        // Temporary message clearing to re-trigger animation
        setMessage('');  // Clear the message first
        setTimeout(() => {
            setMessage('Profile sent successfully!');  // Set the new message after clearing
        }, 10);  // Delay slightly to ensure the state updates properly
        setSelectedProfile(null);  // Clear selection
        setSelectedGroups([]);       // Clear selected groups
    };

    // Callback to handle when a player locks in
    const handleLockIn = (lockedIn) => {
        setIsOverlayVisible(lockedIn);
    };

    useEffect(() => {
        setRoundAnim(currentRound); // Update the round when currentRound changes
    }, [currentRound]);


    if (loading) return <div>Loading...</div>;

    return (
        <div className='room-container'>
            {!showGroupDiscussion && isOverlayVisible && (
                <div>
                    <div className='overlay'>
                        <div className='p-overlay'>
                            <p >You have been marked as Ready!</p>
                            <p >Please wait for the next round.</p>
                        </div>
                    </div>
                </div>
            )}

            {showGroupDiscussion ? (

                <div className='container-discussion'>
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
                    {/* <Chat playerID={playerID} socket={socket} group={group} /> */}

                </div>
            ) : (
                <>
                    {role === 'admin' && currentRound !== 3 ? (
                        <>
                            <div className='outer-container-mod'>

                                <div className='question-by-moderator'>

                                    <div className="selected-groups">
                                        <h3 id='h3-room'>Room Code: <span>{roomId}</span></h3>
                                        <h2 id='h2-room'>Current Round:
                                            <motion.span
                                                key={roundAnim}
                                                initial={{ opacity: 0, y: -20}}  // Start hidden and slightly above
                                                animate={{ opacity: 1, y: 0}}    // Fade in and move to normal position
                                                exit={{ opacity: 0, y: 20 }}       // Fade out and move down
                                                transition={{ duration: 0.5 }}      // Animation duration
                                            >
                                                {currentRound}
                                            </motion.span></h2>
                                        <h4>Select Groups:</h4>
                                        <div className="group-checkboxes">
                                            {availableGroups
                                                .sort((a, b) => a - b)
                                                .map((groupNumber) => {
                                                    const info = groupReadiness[groupNumber] || {};
                                                    const isFullyReady = info.isFullyReady || false;
                                                    const readyCount = info.readyCount || 0;
                                                    const totalCount = info.totalCount || players.filter((p) => p.group === groupNumber).length;

                                                    return (
                                                        <div key={groupNumber} className="group-row">
                                                            <div className="group-info">
                                                                <span className="group-name">Group {groupNumber}: </span>
                                                                {isFullyReady ? (
                                                                    <span className="ready-check"> <span>✔ Fully Ready</span></span>
                                                                ) : (
                                                                    <span className="readiness-status"><span>waiting for players to be ready</span> {readyCount}/{totalCount}</span>
                                                                )}
                                                            </div>
                                                            <label className="group-checkbox">
                                                                <input
                                                                    className="checkbox-input"
                                                                    type="checkbox"
                                                                    value={groupNumber}
                                                                    checked={selectedGroups.includes(groupNumber)}
                                                                    onChange={() => handleCheckboxChange(groupNumber)}
                                                                />
                                                                <span>Select</span>
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                        <button onClick={handleSendProfileToGroups}>Send Profile to Group/s</button>
                                    </div>
                                    <AnimatePresence>
                                        {showMessage && (
                                            <motion.div
                                                className='message-room'
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.1 }}
                                            >
                                                {message}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className='container-profiles'>

                                    <CreateNewProfiles onProfileSelect={handleProfileSelect} socket={socket} />
                                </div>


                            </div>
                        </>

                    ) : (

                        <div className='outer-container'>
                            <div className='information-pannel'>
                                {/* Render RoundOne component */}
                                {currentRound === 1 && (
                                    <div className='outer-cointainer-roun1'>

                                        <RoundOne roomId={roomId} playerID={playerID} socket={socket} group={group} />

                                    </div>
                                )}
                                {currentRound === 2 && (
                                    <div className='outer-cointainer-roun2'>

                                        <RoundTwo
                                            roomId={roomId}
                                            playerID={playerID}
                                            socket={socket}
                                            group={group}
                                            availableGroups={availableGroups}
                                        />

                                    </div>
                                )}
                                {/* Chat Component - Only for Round 1 and Round 2 */}
                                {(currentRound === 1 || currentRound === 2) && (
                                    <div className='chat'>
                                        <h1 id='chat-h1'>Round: {currentRound}</h1>
                                        <h2 id='chat-h2'>Group Number: {group}</h2>
                                        <Chat playerID={playerID} socket={socket} group={group} />
                                    </div>
                                )}
                            </div>
                        </div>

                    )}

                    {currentRound === 3 && (
                        <div className='outer-cointainer-roun3'>

                            <RoundThree roomId={roomId} playerID={playerID} socket={socket} role={role} nationality={nationality} />

                        </div>
                    )}

                </>)

            }
            {/* Role-based layout */}
            <div className='role-based-layout'>
                {role === 'admin' ? (
                    <div className='moderator-container-layout'>
                        <ModeratorRoomLayout roomId={roomId} />
                    </div>
                ) : (

                    <div>
                        {currentRound !== 3 && (

                            < ParticipantRoomLayout
                                roomId={roomId}
                                socket={socket}
                                playerID={playerID}
                                group={group}
                                currentRound={currentRound}
                                onLockIn={handleLockIn}
                            />
                        )}


                    </div>
                )}
            </div>


        </div>
    )
}


export default Room
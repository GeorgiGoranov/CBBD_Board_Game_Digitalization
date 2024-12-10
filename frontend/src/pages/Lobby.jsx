import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import initSocket from '../context/socket';
import "../SCSS/lobby.scss"


const Lobby = () => {
    const { roomId } = useParams(); // Fetch roomId from the URL
    const [players, setPlayers] = useState([]);
    const [groupedPlayers, setGroupedPlayers] = useState([]);

    const socketRef = useRef();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [userSessionCode, setUserSessionCode] = useState(null);
    const [role, setRole] = useState(null); // Role state to determine layout
    const navigate = useNavigate()
    const [playerID, setPlayerID] = useState('');
    const [nationality, setNationality] = useState('')

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
                const response = await fetch('/api/routes/user-role', {
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
        });

        socket.on('playerLeftRoom', (playerList) => {
            setMessage(`${playerList} left the game!`);
        });



        // Cleanup listener when the component unmounts
        return () => {
            socket.off('playerJoined'); // Remove the listener when the component unmounts
            socket.off('updatePlayerList');
            socket.off('playerLeftRoom');

        };
    }, [socket]);

    const handleSaveGroups = async () => {
        const confirmed = window.confirm('You are about to save the groups! Are you sure?');
        if (confirmed) {
            try {
                // Prepare player-group mapping
                const playerGroupAssignments = groupedPlayers.flatMap((group) =>
                    group.players.map((player) => ({
                        playerID: player.playerID,
                        groupNumber: group.groupNumber,
                    }))
                );

                // Send the mapping to the backend
                const response = await fetch('/api/players/update-groups', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ assignments: playerGroupAssignments }),
                });

                if (response.ok) {
                    console.log('Player groups updated successfully!');
                    alert('Player groups have been saved.');
                } else {
                    console.error('Failed to update player groups.');
                    alert('Failed to update player groups.');
                }
            } catch (error) {
                console.error('Error updating player groups:', error);
                alert('An error occurred while saving groups.');
            }
        }
    };

    useEffect(() => {
        if (playerID && roomId) {
            socket.emit('joinSession', { playerID, nationality, gameCode: roomId });
        }

    }, [playerID, roomId, socket])

    if (loading) return <div>Loading...</div>;

    return (

        <div className='lobby-container'>
            <div className='test-layout'>
                <h1>Room ID: {roomId}</h1>
                {message && <p>{message}</p>}

                <h2>Players in the Room:</h2>
                <div className="player-columns">
                    {/* German players */}
                    <div className="german-players">
                        <h3>German Players</h3>
                        <ul>
                            {players
                                .filter(player => player.nationality === 'german')
                                .map((player, index) => (
                                    <li key={index}>{player.playerID}</li>
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
                                    <li key={index}>{player.playerID}</li>
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
                                    <li key={index}>{player.playerID}</li>
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
                       <h1>Room ID: {roomId}</h1>
                       {message && <p>{message}</p>}
       
                       <h2>Players in the Room:</h2>
                       <div className="player-columns">
                           {groupedPlayers.map((group) => (
                               <div
                                   key={group.groupNumber}
                                   className="player-group"
                                   style={{
                                       border: '2px solid red',
                                       padding: '10px',
                                       margin: '10px 0',
                                       borderRadius: '8px',
                                   }}
                               >
                                   <h3>Group {group.groupNumber}</h3>
                                   <ul>
                                       {group.players.map((player) => (
                                           <li key={player.playerID}>{player.playerID}</li>
                                       ))}
                                   </ul>
                               </div>
                           ))}
                       </div>
                       {role === 'admin' && (
                           <button className='btn' onClick={handleSaveGroups}>
                               Save Groups
                           </button>
                       )}
                   </div>
               </div>
                ) : (
                    <div>
                        <div>Player Layout for Room {roomId}
                            You are a participant!
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Lobby
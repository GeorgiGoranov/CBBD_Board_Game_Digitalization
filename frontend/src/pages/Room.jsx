import React, { useState, useEffect  } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import initSocket from '../context/socket';

let hasJoined = false // Ref to track if the user has already joined

const Room = () => {
    const { roomId } = useParams(); // Fetch roomId from the URL
    const [message, setMessage] = useState('');
    const [players, setPlayers] = useState([]);
    const [playerID, setPlayerID] = useState('');
    const socket = initSocket();  
    const navigate = useNavigate()
    
    
    useEffect(() => {

        // Retrieve playerID from localStorage
        const storedPlayerID = localStorage.getItem('playerID');
        setPlayerID(storedPlayerID);

        /* when the page is ran for the first time the boolean is false, 
        we check the stored value in the localStorage and if we have 
        we also check if we have roomID and if so we go in the if statement
        after it has ran once it will try again but because now the value
        of hasJoined is set to true it does not go inside.

        it can be done with useRef react hook but it is almost the same context as the boolean
        */
        if(!hasJoined && storedPlayerID && roomId){
            hasJoined = true;
            // Automatically reconnect the user to the room
            socket.connect()
            socket.emit('joinSession', { playerID: storedPlayerID, gameCode: roomId });
            console.log(`Reconnecting to room: ${roomId} as player: ${storedPlayerID}`);
        }else if (!storedPlayerID){
            //if user is unknow navigate him to dafault page
            navigate('/duser')
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

        // Cleanup listener when the component unmounts
        return () => {
            socket.off('playerJoined'); // Remove the listener when the component unmounts
            socket.off('updatePlayerList');
        };
    }, [roomId,socket, navigate]);
    return (
        <div>
            <h1>Room ID: {roomId}</h1>
            {message && <p>{message}</p>}

            <h2>Players in the Room:</h2>
            <ul>
                {players.map((player, index) => (
                    <li key={index}>{player}</li>
                ))}
            </ul>
        </div>
    )
}


export default Room
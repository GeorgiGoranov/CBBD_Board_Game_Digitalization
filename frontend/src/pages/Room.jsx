import React, { useState, useEffect } from 'react';
import { useParams,useNavigate, replace } from 'react-router-dom';
import initSocket from '../context/socket';


const Room = () => {
    const { roomId } = useParams(); // Fetch roomId from the URL
    const [message, setMessage] = useState('');
    const [playerID, setPlayerID] = useState('');
    const socket = initSocket();  
    const navigate = useNavigate()

    useEffect(() => {

        // Retrieve playerID from localStorage
        const storedPlayerID = localStorage.getItem('playerID');
        setPlayerID(storedPlayerID);

        if(storedPlayerID){
            // Automatically reconnect the user to the room
            socket.connect()
            socket.emit('joinSession', { playerID: storedPlayerID, gameCode: roomId });
        }else{
            //if user is unknow navigate him to dafault page
            navigate('/duser',replace)
        }

       
        // Listen for new players joining the session
        socket.on('playerJoined', (data) => {
            // setPlayers(players);  // Update the players state with the updated list
            setMessage(`${data.playerID} joined the game!`);

        });

        // Cleanup listener when the component unmounts
        return () => {
            socket.off('playerJoined'); // Remove the listener when the component unmounts
        };
    }, [roomId,socket]);
    return (
        <div>
            <h1>Room ID: {roomId}</h1>
            {message && <p>{message}</p>}
        </div>
    )
}


export default Room
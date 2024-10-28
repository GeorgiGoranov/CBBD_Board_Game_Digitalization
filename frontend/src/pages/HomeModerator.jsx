import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import AvailableSessions from '../components/AvailableSessions';
import { useSessionsContext } from '../hooks/useSessionContext';
import "../SCSS/homeModerator.scss"
import initSocket from '../context/socket';

const Home = () => {

  const [sessionCode, setSessionCode] = useState('');
  // const [players, setPlayers] = useState([]);
  const { dispatch } = useSessionsContext()
  const navigate = useNavigate()
  const socket = initSocket();


  const createGameSession = async () => {

    const response = await fetch('/api/routes/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',  // Include cookies (JWT)
    });

    const data = await response.json();
    if (response.ok) {
      dispatch({ type: 'CREATE_SESSIONS', payload: data })
      setSessionCode(data.code); // Show the generated 6-digit code to the moderator
      socket.emit('joinSession', data.code); // Join the session room
    } else {
      alert('Error creating game session');
    }

  };



  const goToCardAndSheetCreation = () => {
    socket.connect()
    navigate('/additions')
  }

  return (
    <div className='container-layout'>
      <div className="create-session">
        <h2>Create a Game Session</h2>
        <button onClick={createGameSession}>Create Session</button>
        <button onClick={goToCardAndSheetCreation}>Create new Cards and Sheets</button>

        {sessionCode && (
          <div className='container'>
            <h3>Game Code: {sessionCode}</h3>
            <p>Share this code with your players to join the session!</p>
          </div>
        )}
      </div>


      <div className='container-for-sessions'>
        <AvailableSessions />
      </div>
    </div>
  );
}


export default Home
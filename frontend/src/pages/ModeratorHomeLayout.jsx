import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import AvailableSessions from '../components/Moderator/AvailableSessions';
import { useSessionsContext } from '../hooks/useSessionContext';
import "../SCSS/homeModerator.scss"

const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;

const Home = () => {

  const [sessionCode, setSessionCode] = useState('');
 
  const { dispatch } = useSessionsContext()
  const navigate = useNavigate()



  const createGameSession = async () => {

    const response = await fetch(`${apiUrl}/api/routes/create-session`, {
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
  
    } else {
      alert('Error creating game session');
    }

  };

  const addNewCompetencies = () =>{
    navigate('/additions/1')
  }

  const createNewProfile = () =>{
    navigate('/additions/2')
  }


  return (
    <div className='container-layout'>
      <div className="create-session">
        <h2>Create a Game Session</h2>
        <button onClick={createGameSession}>Create New Session</button>
        <button onClick={addNewCompetencies}>Create New Competencies</button>
        <button onClick={createNewProfile}>Create New Profiles</button>


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
import React, { useState } from 'react';


const Home = () => {
    const [hostName, setHostName] = useState('');
    const [sessionCode, setSessionCode] = useState('');
  
    const createGameSession = async () => {
      const response = await fetch('/api/routes/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ host: hostName }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setSessionCode(data.code); // Show the generated 6-digit code to the moderator
      } else {
        alert('Error creating game session');
      }
    };
  
    return (
      <div>
        <h2>Create a Game Session</h2>
        <input
          type="text"
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
          placeholder="Enter your name"
        />
        <button onClick={createGameSession}>Create Session</button>
  
        {sessionCode && (
          <div>
            <h3>Game Code: {sessionCode}</h3>
            <p>Share this code with your players to join the session!</p>
          </div>
        )}
      </div>
    );
}


export default Home
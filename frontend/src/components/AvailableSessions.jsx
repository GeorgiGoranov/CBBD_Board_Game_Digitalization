import { useEffect, useState } from "react";
import "../SCSS/availableSessions.scss"
import { useSessionsContext } from '../hooks/useSessionContext';


const AvailableSessions = () => {

    //const [sessions, setSessions] = useState([]);
    const [error, setError] = useState(null);
    const {sessions, dispatch} = useSessionsContext()


    // Function to fetch available sessions
    const fetchSessions = async () => {
        try {
            const response = await fetch('/api/routes/available-sessions'); // Adjust the endpoint accordingly
            if (!response.ok) {
                throw new Error('Error fetching sessions');
            }
            const data = await response.json();
            // setSessions(data); // Assuming the data is an array of sessions
            dispatch({type: 'SET_SESSIONS', payload: data})
        } catch (error) {
            setError(error.message);
        }
    };

    // useEffect to fetch sessions when the component mounts
    useEffect(() => {
        fetchSessions();
    }, []);

    return (
        <div className="container-sessions">
            <h2>Available Game Sessions</h2>
            {error && <p>{error}</p>}
            <div className="idividual-containers">
        
            {sessions && sessions.map((session)=> (
                <li key={session.id || session.code}>
                <p>Session Code: <span>{session.code}</span></p>
                <p>Host: <span>{session.host}</span></p>
                <p>Total Participants: <span>{session.players && session.players.length > 0 ? session.players.length : '0'}</span></p>
                <p>Active: <span>{session.isActive ? 'Yes' : 'No'}</span></p>
            </li>
            ))}

            </div>
        </div>
    )
}


export default AvailableSessions;
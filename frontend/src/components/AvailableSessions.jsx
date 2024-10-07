import { useEffect, useState } from "react";
import "../SCSS/availableSessions.scss"
import { useSessionsContext } from '../hooks/useSessionContext';
import { useNavigate } from 'react-router-dom';


const AvailableSessions = () => {

    //const [sessions, setSessions] = useState([]);
    const [error, setError] = useState(null);
    const { sessions, dispatch } = useSessionsContext()
    const navigate = useNavigate(); // Use navigate to programmatically change routes





    // useEffect to fetch sessions when the component mounts
    useEffect(() => {
        // Function to fetch available sessions
        const fetchSessions = async () => {
            try {
                const response = await fetch('/api/routes/available-sessions');
                if (!response.ok) {
                    throw new Error('Error fetching sessions');
                }
                const data = await response.json();

                dispatch({ type: 'SET_SESSIONS', payload: data })
            } catch (error) {
                setError(error.message);
            }
        };
        fetchSessions();
    }, [dispatch]);

    // Handle Play Button Click - navigate to the session room
    const handlePlayClick = (sessionCode) => {
        navigate(`/session/${sessionCode}`);
    };

    // Handle Play Button Click - navigate to the session room
    const handleDeleteClick = async (sessionCode) => {
        console.log(sessionCode)
        try {
            const response = await fetch(`/api/routes/delete-session/${sessionCode}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Error deleting session');
            }

            // Dispatch the DELETE_SESSION action to remove the session from the state
            dispatch({ type: 'DELETE_SESSION', payload: sessionCode });
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            <h2>Available Game Sessions</h2>
            <div className="container-sessions">
                {error && <p>{error}</p>}
                <div className="idividual-containers">
                    {sessions && sessions.map((session) => (
                        <li key={session.id || session.code}>
                            <div className="container-action-buttons">
                                <p>Session Code: <span>{session.code}</span></p>
                                <div className="container-for-action-buttons">
                                    <i className="bi bi-play-btn-fill" onClick={() => handlePlayClick(session.code)}></i>
                                    <i className="bi bi-x-circle" onClick={() => handleDeleteClick(session.code)}></i>

                                </div>
                            </div>
                            <p>Host: <span>{session.host}</span></p>
                            <p>Total Participants: <span>{session.players && session.players.length > 0 ? session.players.length : '0'}</span></p>
                            <div className="container-for-activity">
                                <p className="p-activity">Active: <span>{session.isActive ? 'Yes' : 'No'}</span></p>
                                <i className="bi bi-sliders"></i>
                            </div>
                        </li>
                    ))}

                </div>

            </div>
        </div>
    )
}


export default AvailableSessions;
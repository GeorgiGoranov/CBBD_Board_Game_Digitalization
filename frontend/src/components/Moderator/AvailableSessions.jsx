import { useEffect, useState } from "react";
import "../../SCSS/availableSessions.scss"
import { useSessionsContext } from '../../hooks/useSessionContext';
import { useNavigate } from 'react-router-dom';
const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;



const AvailableSessions = () => {

    const [error, setError] = useState(null);
    const { sessions, dispatch } = useSessionsContext()
    const navigate = useNavigate(); // Use navigate to programmatically change routes


    // useEffect to fetch sessions when the component mounts
    useEffect(() => {
        console.log(apiUrl)
        // Function to fetch available sessions
        const fetchSessions = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/routes/available-sessions`,{
                    method: 'GET',
                    credentials: 'include', // Include cookies in the request
                });
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
    const handlePlayClick = (session) => {

        if(!session.isActive){
          
            alert(`Session ${session.code} is INACTIVE and cannot be joined.`);
        }else{
            // navigate(`/room/${session.code}`);
            navigate(`/lobby/${session.code}`)

        }

    };

    // Handle Play Button Click - navigate to the session room
    const handleDeleteClick = async (sessionCode) => {
        console.log(sessionCode)
        try {
            const response = await fetch(`/api/routes/delete-session/${sessionCode}`, {
                method: 'DELETE',
                credentials: 'include', // Include JWT cookies
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

    // Function to toggle the activity status
    const handleActivityClick = async (sessionCode) => {
        try {
            // Send request to backend to toggle activity
            const response = await fetch(`/api/routes/toggle-activity/${sessionCode}`, {
                method: 'PATCH',
                credentials: 'include', // Include JWT cookies
                headers: { 'Content-Type': 'application/json' },
            });
            const updatedSession = await response.json();

            if (response.ok) {
                // Update state with the new session data
                dispatch({
                    type: 'UPDATE_SESSION',
                    payload: updatedSession
                });
            } else {
                throw new Error('Error toggling activity');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleResultsClick = (sessionCode) => {
        navigate(`/results?sessionCode=${sessionCode}`)
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
                                    <i className="bi bi-play-btn-fill" onClick={() => handlePlayClick(session)}></i>
                                    <i className="bi bi-x-circle" onClick={() => handleDeleteClick(session.code)}></i>
                                </div>
                            </div>
                            <p>Host: <span>{session.host}</span></p>
                            <p>Total Participants: <span>{session.players && session.players.length > 0 ? session.players.length : '0'}</span></p>
                            <div className="container-for-activity">
                                <p className="p-activity">Active: <span>{session.isActive ? 'Yes' : 'No'}</span></p>
                                <i className="bi bi-sliders" onClick={() => handleActivityClick(session.code)}></i>
                                <i class="bi bi-book-half" onClick={() => handleResultsClick(session.code)} ></i>
                            </div>
                        </li>
                    ))}

                </div>

            </div>
        </div>
    )
}


export default AvailableSessions;
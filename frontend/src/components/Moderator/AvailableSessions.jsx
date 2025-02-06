import { useEffect, useState } from "react";
import "../../SCSS/availableSessions.scss"
import { useSessionsContext } from '../../hooks/useSessionContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;



const AvailableSessions = () => {

    const [error, setError] = useState(null);
    const { sessions, dispatch } = useSessionsContext()
    const navigate = useNavigate(); // Use navigate to programmatically change routes
    const [inactiveSession, setInactiveSession] = useState(null);  // State for inactive session modal



    // useEffect to fetch sessions when the component mounts
    useEffect(() => {
        // Function to fetch available sessions
        const fetchSessions = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/routes/available-sessions`, {
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
        if (!session.isActive) {
            setInactiveSession(session.code);  // Show modal if session is inactive
        } else {
            navigate(`/lobby/${session.code}`);
        }
    };

    const closeModal = () => setInactiveSession(null);


    // Handle Play Button Click - navigate to the session room
    const handleDeleteClick = async (sessionCode) => {
        console.log(sessionCode)
        try {
            const response = await fetch(`${apiUrl}/api/routes/delete-session/${sessionCode}`, {
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
            const response = await fetch(`${apiUrl}/api/routes/toggle-activity/${sessionCode}`, {
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
                                    <i className="bi bi-box-arrow-in-right" onClick={() => handlePlayClick(session)}></i>
                                    <i className="bi bi-trash-fill" onClick={() => handleDeleteClick(session.code)}></i>
                                </div>
                            </div>
                            <p>Host: <span>{session.host}</span></p>
                            <p>Total Participants: <span>{session.players && session.players.length > 0 ? session.players.length : '0'}</span></p>
                            <div className="container-for-activity">
                                <p className="p-activity">Active: <span className={session.isActive ? 'active' : 'inactive'}>{session.isActive ? 'Yes' : 'No'}</span></p>
                                <i className="bi bi-sliders" onClick={() => handleActivityClick(session.code)}></i>
                                <i class="bi bi-kanban-fill" onClick={() => handleResultsClick(session.code)} ></i>
                            </div>
                        </li>
                    ))}

                </div>

            </div>

            {/* Modal for inactive session */}
            <AnimatePresence>
                {inactiveSession && (
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ y: "-20vh", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "-20vh", opacity: 0 }}
                            transition={{ duration: 0.3, type: 'tween' }}
                        >
                            <h3>Inactive Session</h3>
                            <p>The session "{inactiveSession}" is currently inactive and cannot be joined.</p>
                            <div className="modal-buttons">
                                <button onClick={closeModal}>Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}


export default AvailableSessions;
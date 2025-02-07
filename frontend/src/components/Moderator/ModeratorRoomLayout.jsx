
import React, { useEffect, useState, useRef, useContext } from 'react';
import "../../SCSS/moderatorLayout.scss"
import { useSessionsContext } from '../../hooks/useSessionContext';
import { SocketContext } from '../../context/SocketContext';
import ConfirmationPopup from '../ConfirmationPopup';


const ModeratorRoomLayout = ({ roomId }) => {
   
    const [currentRound, setCurrentRound] = useState(0);
    const [inGroupDiscussion, setInGroupDiscussion] = useState(false); // New state for group discussion
    const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;
    const [popupAction, setPopupAction] = useState(null); // Function to run when confirmed
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const { sessions, dispatch } = useSessionsContext()
    const socket = useContext(SocketContext); // Access the same socket instance

    

    // Listen for server updates about round changes
    useEffect(() => {
        socket.on('roundChanged', ({ roundNumber }) => {
            setCurrentRound(roundNumber);
            console.log(`Moderator received: current round is now ${roundNumber}`);
        });

        return () => {
            socket.off('roundChanged');
        };
    }, [socket]);

    // Show confirmation popup
    const showConfirmationPopup = (message, action) => {
        setPopupMessage(message);
        setPopupAction(() => action); // Store the action to execute on confirmation
        setShowPopup(true);
    };


    // const handleStartOfRounds = () => {
    //     if (currentRound >= 1) return;

    //     showConfirmationPopup('You are about to START the game! Are you sure?', () => {
    //         socket.emit('changeRound', { roomId, roundNumber: 1 });
    //     });

    // }

    const handleNextRound = () => {

        if (currentRound >= 2) return;

        showConfirmationPopup('You are about to go to the NEXT game! Are you sure?', () => {
            socket.emit('changeRound', { roomId, roundNumber: 2 });
        });

    }

    const handleNextRound3 = () => {

        if (currentRound >= 3) return;

        showConfirmationPopup('You are about to go to the NEXT game! Are you sure?', () => {
            socket.emit('changeRound', { roomId, roundNumber: 3 });
        });

    }

    const handleConcludeGame = () => {

        showConfirmationPopup('You are about to "END" the game! Are you sure?', () => {
            socket.emit('stopGame', { roomId });
            handleActivityClick(roomId);
        });

    }

    // Handle transitioning to Group Discussion
    const handleStartGroupDiscussion = () => {
        if (currentRound === 0) {
            alert('You must start a round before going to group discussion.');
            return;
        }

        showConfirmationPopup('You are about to START Group Discussion. Are you sure?', () => {
            setInGroupDiscussion(true);
            socket.emit('startGroupDiscussion', { roomId });
        });
    };

    // Handle transitioning from Group Discussion to the next round
    const handleEndGroupDiscussion = () => {
        showConfirmationPopup('You are about to END Group Discussion and proceed to the next round. Are you sure?', () => {
            setInGroupDiscussion(false);
            socket.emit('endGroupDiscussion', { roomId });
        });
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
                console.log("Session Status Changes Successfully")
                dispatch({
                    type: 'UPDATE_SESSION',
                    payload: updatedSession
                });
            } else {
                throw new Error('Error toggling activity');
            }
        } catch (error) {
            console.log(error)
        }
    };


    return (
        <div className="moderator-controls">
           
            {/* <button
                className={`start-btn ${currentRound > 1 ? 'disabled' : ''}`}
                onClick={handleStartOfRounds}
                disabled={currentRound >= 1}
            >
                Start Round 1
            </button> */}
            <button
                className={`next-btn ${currentRound >= 2 || inGroupDiscussion ? 'disabled' : ''}`}
                onClick={handleNextRound}
                disabled={currentRound >= 2}
            >
                Start Round 2
            </button>
            <button
                className={`next-btn ${currentRound >= 3 || inGroupDiscussion ? 'disabled' : ''}`}
                onClick={handleNextRound3}
                disabled={currentRound >= 3}

            >
                Start Round 3
            </button>
            <button className={`group-discussion-btn ${currentRound >= 3 || inGroupDiscussion ? 'disabled' : ''}`} onClick={handleStartGroupDiscussion} disabled={inGroupDiscussion}>
                Start Group Discussion
            </button>
            {inGroupDiscussion && (
                <button className="end-group-discussion-btn" onClick={handleEndGroupDiscussion}>
                    End Group Discussion
                </button>
            )}
            <button className={`stop-game-btn ${currentRound < 3 ? 'disabled' : ''}`} 
            onClick={handleConcludeGame}
            >
                Stop Game
            </button>

            {/* Confirmation Popup */}
            {showPopup && (
                <ConfirmationPopup
                    message={popupMessage}
                    onConfirm={() => {
                        popupAction();  // Execute the stored action
                        setShowPopup(false);  // Close the popup
                    }}
                    onCancel={() => setShowPopup(false)}
                />
            )}
        </div>

    )
}

export default ModeratorRoomLayout
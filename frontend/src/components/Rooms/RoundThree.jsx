import { useEffect, useState, useCallback } from "react";
import { useLanguage } from '../../context/LanguageContext';
import "../../SCSS/roundThree.scss"
    ;

const RoundThree = ({ roomId, playerID, socket, role, nationality }) => {
    const [card, setCard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { language } = useLanguage();
    const [votes, setVotes] = useState({});
    const [userVote, setUserVote] = useState(null);
    const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;


    const fetchCurrentState = useCallback(async () => {
        try {
            const response = await fetch(`${apiUrl}/api/rounds/get-state-third-round/${roomId}`, {
                credentials: 'include', // Include JWT cookies
            });
            if (!response.ok) {
                throw new Error('Failed to fetch the current state');
            }
            const data = await response.json();
            setCard(data.card || []);
            setVotes(data.votes || {});
            if (data.votes && data.votes[playerID]) {
                setUserVote(data.votes[playerID]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, roomId, playerID]);

    const saveState = useCallback(async (currentCard, currentVote) => {
        try {
            const body = { roomId, playerID, nationality };
            if (currentCard) body.card = currentCard;
            if (currentVote) body.vote = currentVote;

            const response = await fetch(`${apiUrl}/api/rounds/save-state-third-round`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error saving state:', errorData.message);
            } else {
                console.log('State saved successfully');
            }
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }, [apiUrl, roomId, playerID, nationality]);

    const fetchRandomCard = useCallback(async () => {
        if (role === 'admin') {
            try {
                const response = await fetch(`${apiUrl}/api/cards/dilemma/random/${roomId}`, {
                    credentials: 'include', // Include JWT cookies
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch a random card');
                }
                const data = await response.json();
                setCard(data);

                // Save the new card to the backend
                await saveState(data, null);

                // Emit the card to all players in the room
                socket.emit('newDilemmaCardData', { roomId, card: data });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    }, [role, apiUrl, roomId, saveState, socket]);




    const handleVote = (option) => {
        if (role === 'admin') {
            // Prevent admins from voting
            alert('Admins are not allowed to vote');
            return;
        }
        socket.emit('vote', { vote: option, roomId });
        setUserVote(option); // Store the user's selected option
        saveState(null, option); // Save the selected option
    };

    useEffect(() => {
        if (role === 'admin') {
            fetchRandomCard();
        } else {
            setTimeout(()=>{

                fetchCurrentState();
            }, 2000)
        }
    }, [role, fetchRandomCard, fetchCurrentState]);


    useEffect(() => {

        socket.on('updateDilemmaCardData', (newCard) => {
            setCard(newCard);
            setUserVote(null);  // <--- Reset user's vote here so they can vote on the new card
        });
        socket.on('updateVotes', setVotes);



        // Cleanup listener on component unmount
        return () => {
            socket.off('nextDilemmaCard');
            socket.off('updateDilemmaCardData');
            socket.off('updateVotes');
        };
    }, [socket]);


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const options = card?.options?.[language]; // Extract options for the selected language
    if (!options) return <div>No card or options available</div>;

    return (
        <div className="round-three-container">
            <div>
                <h1>Dilemma Card</h1>
                <h2>Category: {card.category || "Unknown"}</h2>
                <p>Subcategory: {card.subcategory || "Unknown"}</p>

                <div className="options-container-dilemma">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className={`option-item-dilemma ${userVote === option ? 'voted' : ''}`}
                            onClick={() => userVote === null && role !== 'admin' && handleVote(option)}
                            style={{
                                cursor: userVote === null && role !== 'admin' ? "pointer" : "not-allowed",
                                backgroundColor: userVote === option ? "#cce5ff" : ""
                            }}
                        >
                            {option} {votes[option] ? `- Votes: ${votes[option]}` : ''}
                        </div>
                    ))}
                </div>

            </div>
            {role === 'admin' && (
                <div className='moderator-container-layout'>
                    <i className="bi bi-arrow-right-circle" onClick={fetchRandomCard}></i>
                </div>
            )}
        </div>

    );

};

export default RoundThree;

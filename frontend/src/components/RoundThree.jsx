import { useEffect, useState, useCallback } from "react";
import { useLanguage } from '../context/LanguageContext';
import "../SCSS/roundThree.scss"
    ;

const RoundThree = ({ roomId, playerID, socket }) => {
    const [card, setCard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { language } = useLanguage();
    const [votes, setVotes] = useState({ agree: 0, disagree: 0 });
    const [userVote, setUserVote] = useState('');


    const saveState = useCallback(async (currentCard, currentVote) => {
        try {
            const body = {
                roomId,
                playerID,
            };
            if (currentCard) {
                body.card = currentCard;
            }
            if (currentVote) {
                body.vote = currentVote;
            }
            const response = await fetch('/api/rounds/save-state-third-round', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                console.log('State saved successfully');
            } else {
                const errorData = await response.json();
                console.error('Error saving state:', errorData.message);
            }
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }, [roomId, playerID]);


    const fetchRandomCard = async () => {
        try {
            const response = await fetch('/api/cards/dilemma/random');
            if (!response.ok) {
                throw new Error('Failed to fetch a random card');
            }
            const data = await response.json();
            console.log('Card being sent:', data);

            setCard(data);

            // Reset user's vote when a new card is fetched
            setUserVote('');
            setVotes({ agree: 0, disagree: 0 });

            // Save the new card to the backend
            await saveState(data, null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    const handleVote = (vote) => {
        socket.emit('vote', { vote, roomId });
        setUserVote(vote); // Store the user's vote
        // Save state with current card and vote
        saveState(null, vote);
    };



    useEffect(() => {
        fetchRandomCard(); // Fetch card initially

        // Listen for WebSocket event
        socket.on('newDilemmaCard', fetchRandomCard);

        socket.on('updateVotes', (updatedVotes) => {
            setVotes(updatedVotes);

        });

        // Cleanup listener on component unmount
        return () => {
            socket.off('newDilemmaCard', fetchRandomCard);
            socket.off('updateVotes');
        };
    }, [socket, saveState]);



    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const options = card?.options?.[language]; // Extract the options for the selected language

    if (!options) {
        return <div>No options available for the selected language</div>;
    }


    return (
        <div className="round-three-container">
            <div>
                <h1>Random Dilemma Card</h1>
                <h2>Category: {card.category}</h2>
                <p>Subcategory: {card.subcategory}</p>

                <div className="options-container-dilemma">
                    {options.map((option, index) => (
                        <div key={index} className="option-item-dilemma">
                            {option}
                        </div>
                    ))}
                </div>
            </div>
            <div className="vote-container">
                <button
                    className="vote-btn"
                    onClick={() => handleVote('agree')}
                    disabled={userVote !== ''}
                >
                    Agree
                </button>
                <button
                    className="vote-btn"
                    onClick={() => handleVote('disagree')}
                    disabled={userVote !== ''}
                >
                    Disagree
                </button>
            </div>
            <div className="vote-results">
                <p>Votes for: {votes.agree}</p>
                <p>Votes against: {votes.disagree}</p>
            </div>
        </div>
    );
};

export default RoundThree;

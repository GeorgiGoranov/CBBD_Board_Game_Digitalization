import { useEffect, useState, useCallback } from "react";
import { useLanguage } from '../../context/LanguageContext';
import "../../SCSS/roundThree.scss"
    ;

const RoundThree = ({ roomId, playerID, socket, role }) => {
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

            // Save the new card to the backend
            await saveState(data, null);

            // Emit the card to all players in the room
            socket.emit('newDilemmaCardData', { roomId, card: data });

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

    // const fetchRoomState = async () => {
    //     try {
    //         const response = await fetch(`/api/rounds/get-state-third-round/${roomId}`);
    //         if (!response.ok) {
    //             throw new Error("Failed to fetch room state");
    //         }
    //         const data = await response.json();

    //         // Check if cards array exists and has at least one card
    //         if (data.cards && data.cards.length > 0) {
    //             const lastCard = data.cards[data.cards.length - 1]; // Get the last card
    //             setCard(lastCard.card); // Set the card state
    //             if (lastCard.votes) {
    //                 setVotes({
    //                     agree: lastCard.votes.agree.count,
    //                     disagree: lastCard.votes.disagree.count,
    //                 });
    //             }
    //         } else {
    //             console.warn("No cards found in the fetched room state.");
    //         }
    //     } catch (err) {
    //         setError(err.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    //on start fetch

    useEffect(() => {
        fetchRandomCard()
    }, [])


    useEffect(() => {


        socket.on('updateDilemmaCardData', (cardData) => {
            setCard(cardData);
        });

        socket.on('updateVotes', (updatedVotes) => {
            setVotes(updatedVotes);

        });

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

    if (!card || !options) {
        return <div>No card or options available for the selected language</div>;
    }

    const handleNextDilemma = () => {
        fetchRandomCard()
    };



    return (
        <div className="round-three-container">
            <div>
                <h1>Dilemma Card</h1>
                <h2>Category: {card.category || "Unknown"}</h2>
                <p>Subcategory: {card.subcategory || "Unknown"}</p>

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

                {role === 'admin' && (
                    <div className='moderator-container-layout'>
                        <i class="bi bi-arrow-right-circle" onClick={handleNextDilemma}></i>
                    </div>
                )}

            </div>

        </div>


    );

};

export default RoundThree;

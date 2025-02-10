import { useEffect, useState, useCallback } from "react";
import { useLanguage } from '../../context/LanguageContext';
import "../../SCSS/roundThree.scss"
    ;

const RoundThree = ({ roomId, playerID, socket, role, nationality }) => {
    const [card, setCard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { language } = useLanguage();
    //store separate counters for the two options
    const [voteCounts, setVoteCounts] = useState({ option1: 0, option2: 0 });
    // Track the user's own choice if needed
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
            // setVotes(data.votes || {});
            if (data.votes && data.votes[playerID]) {
                setUserVote(data.votes[playerID]);// "option1" or "option2"
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
            if (currentVote) body.vote = currentVote; // "option1" or "option2"

            const response = await fetch(`${apiUrl}/api/rounds/save-state-third-round`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error saving state:', errorData.message);
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

                // 1. Emit the new card
                socket.emit('newDilemmaCardData', { roomId, card: data });

                // 2. Emit reset votes **after** the new card arrives
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
        setUserVote(option); // Store the user's selected option
        socket.emit('vote', { vote: option, roomId });
        saveState(null, option); // Save the selected option
    };

    useEffect(() => {
        if (role === 'admin') {
            fetchRandomCard();
        } else {
            setTimeout(() => {

                fetchCurrentState();
            }, 1500)
        }
    }, [role, fetchRandomCard, fetchCurrentState]);


    useEffect(() => {

        socket.on('updateDilemmaCardData', (newCard) => {
            setCard(newCard);
            setUserVote(null);  // <--- Reset user's vote here so they can vote on the new card
            // Also reset local counters if needed
            setVoteCounts({ option1: 0, option2: 0 });
        });
        // This event returns something like { option1: X, option2: Y }
        socket.on('updateVotes', (roomVotes) => {
            setVoteCounts({
                option1: roomVotes.option1 || 0,
                option2: roomVotes.option2 || 0
            });
        });



        // Cleanup listener on component unmount
        return () => {
            socket.off('updateDilemmaCardData');
            socket.off('updateVotes');
        };
    }, [socket]);


    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const cardOptions = card?.options?.[language]; // Extract options for the selected language

    if (!cardOptions) return <div className="end">
         
        <p>These were all the cards.</p>
        <p>Thank you for playing!</p>

    </div>;


    return (
        <div className="round-three-container">
            <div>
                <h1>Dilemma Card</h1>
                <h2>Category: <span>{card.category || "Unknown"}</span></h2>
                <p>Subcategory: <span>{card.subcategory || "Unknown"}</span></p>

                <div className="options-container-dilemma">
                    {cardOptions.map((cardOptions, index) => {
                        // If userVote is 'option1' and index = 0 => highlight
                        // If userVote is 'option2' and index = 1 => highlight
                        const isVoted =
                            (userVote === 'option1' && index === 0) ||
                            (userVote === 'option2' && index === 1);

                        return (
                            <div
                                key={index}
                                className={`option-item-dilemma ${isVoted ? 'voted' : ''}`}
                                onClick={() =>
                                    userVote === null && role !== 'admin' && handleVote(`option${index + 1}`)
                                }
                                style={{
                                    cursor: userVote === null && role !== 'admin' ? 'pointer' : 'not-allowed',
                                    backgroundColor: isVoted ? '#cce5ff' : ''
                                }}
                            >
                                {cardOptions}
                            </div>
                        );
                    })}
                </div>

            </div>
            <div className="score-keepers">
                <div>

                    <h3>Voting Scores</h3>
                </div>

                <div className="score-display">
                    <p>{voteCounts.option1}</p>
                    <p>{voteCounts.option2}</p>
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

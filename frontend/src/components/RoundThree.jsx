import { useEffect, useState } from "react";
import { useLanguage } from '../context/LanguageContext';
import "../SCSS/roundThree.scss"
    ;

const RoundThree = ({ roomId, playerID, socket }) => {
    const [card, setCard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { language } = useLanguage();
    const [votes, setVotes] = useState({ one: 0, two: 0 });


    const fetchRandomCard = async () => {
        try {
            const response = await fetch('/api/cards/dilemma/random');
            if (!response.ok) {
                throw new Error('Failed to fetch a random card');
            }
            const data = await response.json();
            setCard(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = (vote) => {
        socket.emit('vote', { vote });
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
    }, [socket]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="round-three-container">
            <h1>Random Dilemma Card</h1>
            <h2>Category: {card.category}</h2>
            <p>Subcategory: {card.subcategory}</p>
            <div className="card-options">
                <span>Options:</span> {card.options[language]}
            </div>
            <div className="vote-container">
                <button className="vote-btn" onClick={() => handleVote('one')}>
                    One
                </button>
                <button className="vote-btn" onClick={() => handleVote('two')}>
                    Two
                </button>
            </div>
            <div className="vote-results">
                <p>Votes for One: {votes.one}</p>
                <p>Votes for Two: {votes.two}</p>
            </div>
        </div>
    );
};

export default RoundThree;

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../SCSS/results.scss'

const Results = () => {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get('sessionCode');


    const [firstRoundDropZones, setFirstRoundDropZones] = useState(null);
    const [secondRoundDropZones, setSecondRoundDropZones] = useState(null);
    const [thirdRoundDropZones, setThirdRoundDropZones] = useState(null);


    const [error, setError] = useState(null);

    const fetchRoundData = async () => {
        try {
            // Run both fetch calls concurrently and handle their results
            const [firstRoundResult, secondRoundResult, thirdRoundResults] = await Promise.allSettled([
                fetch(`/api/rounds/get-state-first-round/${roomId}`),
                fetch(`/api/rounds/get-state-second-round/${roomId}`),
                fetch(`/api/rounds/get-state-third-round/${roomId}`),

            ]);

            // Handle first round fetch
            if (firstRoundResult.status === 'fulfilled' && firstRoundResult.value.ok) {
                const firstRoundData = await firstRoundResult.value.json();
                setFirstRoundDropZones(firstRoundData.groups || {});
            } else {
                console.error('First round fetch failed:', firstRoundResult.reason || await firstRoundResult.value.text());
                setFirstRoundDropZones([]);
            }

            // Handle second round fetch
            if (secondRoundResult.status === 'fulfilled' && secondRoundResult.value.ok) {
                const secondRoundData = await secondRoundResult.value.json();
                setSecondRoundDropZones(secondRoundData.groups || {});
            } else {
                console.error('Second round fetch failed:', secondRoundResult.reason || await secondRoundResult.value.text());
                setSecondRoundDropZones([]);
            }

            // Third Round
            if (thirdRoundResults.status === 'fulfilled' && thirdRoundResults.value.ok) {
                const thirdRound = await thirdRoundResults.value.json();
                setThirdRoundDropZones(thirdRound.cards || []);
            } else {
                console.warn('Third round fetch failed:', thirdRoundResults.reason || await thirdRoundResults.value.text());
                setThirdRoundDropZones([]);
            }

        } catch (error) {
            console.error('Error fetching round data:', error);
            setError('Error fetching data for rounds.');
        }
    };



    useEffect(() => {
        fetchRoundData();
    }, [roomId]);

    const renderDropZones = (groups, roundTitle) => (
        <div>
            <h3>{roundTitle} Decisions:</h3>
            {groups.length > 0 ? (
                groups.map((group, gIndex) => (
                    <div key={gIndex} className="group-section">
                        <h4>Group {group.groupNumber}</h4>
                        {Object.entries(group.dropZones || {}).map(([zone, items]) => (
                            <div key={zone} className="drop-zone">
                                <h5>{zone}:</h5>
                                {items.length > 0 ? (
                                    <ul>
                                        {items.map((item, index) => (
                                            <li key={index}>{item.category || 'Unnamed Item'}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>Empty</p>
                                )}
                            </div>
                        ))}
                        {group.messages && group.messages.length > 0 && (
                            <div className="messages">
                                <h5>Messages:</h5>
                                <ul>
                                    {group.messages.map((msg, i) => (
                                        <li key={i}>{msg}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p>No groups found for {roundTitle}</p>
            )}
        </div>
    );



    const renderThirdRoundCards = (cards) => (
        <div>
            <h3>Third Round Decisions:</h3>
            {cards.length > 0 ? (
                cards.map((cardData, index) => (
                    <div key={index} className="card">
                        <h4>Category: {cardData.card.category || 'Unknown'}</h4>
                        <h5>Subcategory: {cardData.card.subcategory || 'Unknown'}</h5>
                        <div className="votes">
                            {Object.keys(cardData.votes).length > 0 ? (
                                Object.entries(cardData.votes).map(([option, voteData]) => (
                                    <p key={option}>{option} Votes: {voteData.count}</p>
                                ))
                            ) : (
                                <p>No votes recorded.</p>
                            )}
                        </div>
                        <div className="options">
                            <h5>Options (NL):</h5>
                            <ul>
                                {(cardData.card.options?.nl || []).map((option, nlIndex) => (
                                    <li key={`nl-${nlIndex}`}>{option}</li>
                                ))}
                            </ul>
                            <h5>Options (DE):</h5>
                            <ul>
                                {(cardData.card.options?.de || []).map((option, deIndex) => (
                                    <li key={`de-${deIndex}`}>{option}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))
            ) : (
                <p>No cards available for the third round.</p>
            )}
        </div>
    );


    return (
        <div className="results-container">
            <h2>Results Page</h2>
            <p>Game Session Results for Room ID: {roomId}</p>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className='results'>
                {/* First Round */}
                {firstRoundDropZones ? renderDropZones(firstRoundDropZones, 'First Round') : <p>Loading first round data...</p>}

                {/* Second Round */}
                {secondRoundDropZones ? renderDropZones(secondRoundDropZones, 'Second Round') : <p>Loading second round data...</p>}

                {/* Third Round */}
                {thirdRoundDropZones ? renderThirdRoundCards(thirdRoundDropZones) : <p>Loading third round data...</p>}

            </div>

        </div>
    );
};

export default Results;

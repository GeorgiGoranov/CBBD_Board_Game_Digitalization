import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../SCSS/results.scss'
import { useLanguage } from '../context/LanguageContext';


const Results = () => {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get('sessionCode');

    const [firstRoundDropZones, setFirstRoundDropZones] = useState(null);
    const [secondRoundDropZones, setSecondRoundDropZones] = useState(null);
    const [thirdRoundDropZones, setThirdRoundDropZones] = useState(null);

    const { language } = useLanguage();

    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;

    useEffect(() => {
        const fetchRoundData = async () => {
            try {
                // Run both fetch calls concurrently and handle their results
                const [firstRoundResult, secondRoundResult, thirdRoundResults] = await Promise.allSettled([
                    fetch(`${apiUrl}/api/rounds/get-state-first-round/${roomId}`),
                    fetch(`${apiUrl}/api/rounds/get-state-second-round/${roomId}`),
                    fetch(`${apiUrl}/api/rounds/get-all-state-third-round-cards/${roomId}`),

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

        fetchRoundData();
    }, [roomId, apiUrl]);

    // -----------------------------
    //  CSV Export Functions
    // -----------------------------
    // Pseudocode to illustrate the concept
    const handleExportCsv = () => {
        // 1) Flatten data for Rounds 1 & 2
        const round12Data = flattenRounds1And2(firstRoundDropZones, secondRoundDropZones);
        console.log(round12Data)
        const csvRound12 = convertArrayOfObjectsToCSV(round12Data);

        // 2) Flatten data for Round 3
        const round3Data = flattenRound3(thirdRoundDropZones);
        const csvRound3 = convertArrayOfObjectsToCSV(round3Data);

        // 3) Concatenate
        // Insert a blank line (or a labeled line) between them
        // Example also adds a text row "THIRD ROUND STARTS" for clarity
        const finalCsv =
            csvRound12
            + '\n\nTHIRD ROUND\n'
            + csvRound3;

        // 4) Download as single .csv
        downloadCSV(finalCsv, 'all_rounds.csv');
    };

    // Example flatten function for Rounds 1 & 2:
    function flattenRounds1And2(firstRound, secondRound) {
        const groupedData = {};

        // Helper to group by group number
        const addToGroup = (groupNum, round, zone, item, nationalityInfo) => {
            if (!groupedData[groupNum]) groupedData[groupNum] = [];
            groupedData[groupNum].push({
                round,
                priority: zone,
                competency: item,
                nationality: nationalityInfo,
            });
        };

        // Process first round data
        firstRound?.forEach(group => {
            const groupNum = group.groupNumber ?? 0;
            Object.entries(group.dropZones || {}).forEach(([zone, items]) => {
                items.forEach(item => {
                    addToGroup(groupNum, 'First Round', zone, item.category || 'Unnamed Item', JSON.stringify(group.nationalities || []));
                });
            });
        });

        // Process second round data
        secondRound?.forEach(group => {
            const groupNum = group.groupNumber ?? 0;
            Object.entries(group.dropZones || {}).forEach(([zone, items]) => {
                items.forEach(item => {
                    addToGroup(groupNum, 'Second Round', zone, item.text || 'Unnamed Item', JSON.stringify(group.nationalities || []));
                });
            });
        });

        // Return sorted data by group number
        return Object.entries(groupedData).flatMap(([groupNum, groupItems]) => {
            return groupItems.map(item => ({
                group: groupNum,
                ...item,
            }));
        });
    }



    // Example flatten function for Round 3:
    function flattenRound3(thirdRound) {
        // Return an array of objects with columns:
        // [category, subcategory, optionKey, optionText, voteCount, german, dutch, other]
        const data = [];
        thirdRound?.forEach(cardData => {
            const category = cardData.card?.category ?? '';
            const subcategory = cardData.card?.subcategory ?? '';

            Object.entries(cardData.votes ?? {}).forEach(([optionKey, voteData]) => {
                const { german = 0, dutch = 0, other = 0 } = voteData?.nationalities || {};
                // You might map "option1" to the actual text, or just store "option1"
                // If you want to retrieve the text from cardData.card.options, do so here:
                const optionIndex = parseInt(optionKey.replace(/[^\d]/g, '')) - 1;
                const optionText = cardData.card?.options?.en?.[optionIndex] || '';

                data.push({
                    category,
                    subcategory,
                    optionText,
                    voteCount: voteData.count || 0,
                    german,
                    dutch,
                    other
                });
            });
        });
        return data;
    }

    // The same CSV conversion and download logic as before:
    function convertArrayOfObjectsToCSV(dataArray) {
        if (!dataArray || !dataArray.length) return '';

        // 1) Collect headers dynamically
        const allKeys = new Set();
        dataArray.forEach(obj => {
            Object.keys(obj).forEach(key => allKeys.add(key));
        });
        const headers = Array.from(allKeys);

        // 2) Create CSV rows
        const lines = [headers.join(',')];  // CSV header row
        let currentGroup = null;

        dataArray.forEach(row => {
            // Add a blank line between groups
            if (currentGroup !== row.group) {
                if (currentGroup !== null) {
                    lines.push('');  // Add a blank line between groups
                }
                currentGroup = row.group;
            }

            // Convert row to CSV-friendly format
            const rowValues = headers.map(header => {
                const val = String(row[header] ?? '').replace(/"/g, '""');
                return val.search(/("|,|\n)/g) >= 0 ? `"${val}"` : val;
            });
            lines.push(rowValues.join(','));
        });

        return lines.join('\n');
    }



    function downloadCSV(csvString, filename) {
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }



    const renderDropZones = (groups, roundTitle) => {
        const isFirstRound = roundTitle.includes('First Round');
        const isSecondRound = roundTitle.includes('Second Round');
        // Ensures group numbers are sequentially mapped starting from 1
        const remappedGroups = groups.map((group, index) => ({
            ...group,
            groupNumber: index + 1, // Forces group numbers to start from 1 and increment sequentially
        }));

        return (
            <div >
                <h3>{roundTitle} Decisions:</h3>
                {remappedGroups.length > 0 ? (
                    remappedGroups.map((group, gIndex) => (
                        <div key={gIndex} className="group-section">
                            <div className='groups'>

                                <h4>Group {group.groupNumber}</h4>
                                {/* Display Nationalities if available */}
                                {group.nationalities && group.nationalities.length > 0 && (
                                    <div className="nationalities">
                                        {/* <h5>Nationalities:</h5> */}
                                        {/* Each element is an object, so map over them */}
                                        {group.nationalities.map((natObject, index) => (
                                            <ul key={index}>
                                                {/* natObject looks like { german: 2, dutch: 1, ... } */}
                                                {Object.entries(natObject).map(([natKey, natCount]) => (
                                                    <li key={natKey}>
                                                        {natKey} ({natCount})
                                                    </li>
                                                ))}
                                            </ul>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {Object.entries(group.dropZones || {}).map(([zone, items]) => (
                                <div key={zone} className="drop-zone">
                                    {/* Format the zone to split "priority1" into "priority 1" */}
                                    <h5>{zone.replace(/(\D+)(\d+)/, '$1 $2')} :</h5>
                                    {items.length > 0 ? (
                                        <ul>
                                            {items.map((item, index) => (
                                                <span key={index} className='item-dz'>
                                                    {isFirstRound ? (
                                                        item.category || 'Unnamed Item'
                                                    ) : isSecondRound ? (
                                                        item.text || 'Unnamed Option'
                                                    ) : (
                                                        'Invalid Round Data'
                                                    )}
                                                    {/* Add a comma if it's not the last item */}
                                                    {index < items.length - 1 && <span id='s-box'>, </span> }
                                                </span>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>Empty</p>
                                    )}
                                </div>
                            ))}
                            {group.messages && group.messages.length > 0 && (
                                <div className="messages">
                                    <h5>Competency:</h5>
                                    <ul>
                                        {group.messages.map((msg, i) => (
                                            <li key={i} className="message-item">
                                                <p><strong>Profile Name:</strong> {msg.profile.name || 'Unnamed Profile'}</p>
                                                {/* <p><strong>Description:</strong> {msg.profile.options?.en || 'Description not available'}</p> */}
                                            </li>
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
    };

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
                                    <div key={option}>
                                        <p> Vote Count : {voteData.count}</p>
                                        <div className='container-votes-options'>
                                            <p className='votes-options'>German: {voteData.nationalities.german || 0}</p>
                                            <p className='votes-options'>Dutch: {voteData.nationalities.dutch || 0}</p>
                                            <p className='votes-options'>Other: {voteData.nationalities.other || 0}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No votes recorded.</p>
                            )}
                        </div>

                        <div className="options">

                            <h5>Options ({language.toUpperCase()}):</h5>
                            <ul>
                                {(cardData.card.options?.[language] || []).map((option, nlIndex) => (
                                    <li key={`nl-${nlIndex}`}>{option}</li>
                                ))}
                            </ul>
                        </div>


                        {/* {Object.keys(cardData.votes).length > 0 ? (
                            (cardData.card.options?.[language] || []).map((optionText, index) => {
                                // Dynamically get the corresponding vote key based on the index
                                const voteKey = `option${index + 1}`;
                                const voteData = cardData.votes[voteKey];

                                return (
                                    <div key={index} className="votes">
                                        <h3>{optionText}</h3> {/* Display the option text */}
                        {/* {voteData ? (
                                            <>
                                                <p>Votes: {voteData.count}</p>
                                                <ul>
                                                    <li className='votes-options'>German: {voteData.nationalities.german || 0}</li>
                                                    <li className='votes-options'>Dutch: {voteData.nationalities.dutch || 0}</li>
                                                    <li className='votes-options'>Other: {voteData.nationalities.other || 0}</li>
                                                </ul>
                                            </>
                                        ) : (
                                            <p>No votes for this option.</p>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p>No votes recorded.</p>
                        )} */}


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
            {/* Button to trigger CSV download */}
            <button onClick={handleExportCsv}>Download Results as CSV</button>
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

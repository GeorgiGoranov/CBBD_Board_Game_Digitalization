import React, { useEffect, useState } from 'react';

const CreateNewProfiles = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;

    useEffect(() => {
        // Fetch profiles from the API
        const fetchProfiles = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/cards/profiles`);  // Replace with your correct endpoint
                if (!response.ok) {
                    throw new Error('Failed to fetch profiles');
                }

                const data = await response.json();
                setProfiles(data);  // Update state with fetched profiles
                setLoading(false);
            } catch (err) {
                console.error('Error fetching profiles:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProfiles();
    }, []);  // Run only once on component mount

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <h2>Profiles</h2>
            <ul>
                {profiles.map((profile, index) => (
                    <li key={index}>
                        <h3>{profile.name}</h3>
                        <p>{profile.options.en}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CreateNewProfiles;

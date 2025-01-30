import React, { useEffect, useState } from 'react';
import '../../SCSS/createNewProfiles.scss'
import { useSessionsContext } from '../../hooks/useSessionContext'; // Adjust the path if needed



const CreateNewProfiles = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;
    const [titleOfProfile, setTitleOfProfile] = useState('');
    const [descriptionOfProfile, setdescriptionOfProfile] = useState('');
    const { sessions, dispatch } = useSessionsContext();  // Use the custom hook to access context


    // Save new profile to the backend
    const saveNewProfile = async (e) => {
        e.preventDefault();

        if (titleOfProfile.trim() === '' || descriptionOfProfile.trim() === '') {
            alert('Both title and description are required!');
            return;
        }

        try {
            const newProfile = {
                name: titleOfProfile,
                options: {
                    en: descriptionOfProfile
                }
            };

            // Make a POST request to save the new profile
            const response = await fetch(`${apiUrl}/api/cards/create-profiles`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newProfile)
            });

            if (!response.ok) {
                throw new Error('Failed to save the new profile');
            }

            const savedProfile = await response.json();

            // Update the context with the new profile
            dispatch({ type: 'CREATE_SESSIONS', payload: savedProfile });

            // Clear form fields
            setTitleOfProfile('');
            setdescriptionOfProfile('');
        } catch (err) {
            console.error('Error saving profile:', err);
            setError(err.message);
        }
    };


    useEffect(() => {
        // Fetch profiles from the API
        const fetchProfiles = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/cards/profiles`,{
                    credentials: 'include'
                });  // Replace with your correct endpoint
                if (!response.ok) {
                    throw new Error('Failed to fetch profiles');
                }

                const data = await response.json();
                // Update context with fetched profiles
                dispatch({ type: 'SET_SESSIONS', payload: data });
                // setProfiles(data)
                setLoading(false);
            } catch (err) {
                console.error('Error fetching profiles:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProfiles();
    }, [apiUrl, dispatch]);  // Run only once on component mount

    // Delete a profile from the backend and update the context
    const deleteProfile = async (profileId) => {
        try {
            const response = await fetch(`${apiUrl}/api/cards/delete-profiles/${profileId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to delete the profile');
            }

            // Update the context by removing the deleted profile
            dispatch({ type: 'DELETE_SESSION_PROFILE', payload: profileId });
        } catch (err) {
            console.error('Error deleting profile:', err);
            setError(err.message);
        }
    };


    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <h2>Profiles</h2>
            <form className="container-input-add-new-profile" onSubmit={saveNewProfile}>
                <input
                    type="text"
                    value={titleOfProfile}
                    onChange={(e) => setTitleOfProfile(e.target.value)}
                    placeholder="Title of the Profile"
                    className='input-add-new-profile'
                />
                <textarea 
                    type="text"
                    value={descriptionOfProfile}
                    onChange={(e) => setdescriptionOfProfile(e.target.value)}
                    placeholder="Description of the Profile"
                    className='input-add-new-profile-description'
                />
                <button type="submit">Add</button>
            </form>
            <ul>
                {sessions.map((profile, index) => (
                    <li key={index}>
                        <h3>{profile.name}</h3>
                        <p>{profile.options.en}</p>
                        <button onClick={() => deleteProfile(profile._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CreateNewProfiles;

import React, { useEffect, useState } from 'react';
import '../../SCSS/createNewProfiles.scss'
import { useSessionsContext } from '../../hooks/useSessionContext'; // Adjust the path if needed
import { motion, AnimatePresence } from 'framer-motion';



const CreateNewProfiles = ({ onProfileSelect, socket }) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;
    const [titleOfProfile, setTitleOfProfile] = useState('');
    const [descriptionOfProfile, setdescriptionOfProfile] = useState('');
    const { sessions, dispatch } = useSessionsContext();  // Use the custom hook to access context
    const [collapsedProfiles, setCollapsedProfiles] = useState({});
    const [selectedProfileId, setSelectedProfileId] = useState(null); // New state for selected profile


    console.log(socket)
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
                const response = await fetch(`${apiUrl}/api/cards/profiles`, {
                    credentials: 'include'
                });  // Replace with your correct endpoint
                if (!response.ok) {
                    throw new Error('Failed to fetch profiles');
                }

                const data = await response.json();
                // Update context with fetched profiles
                dispatch({ type: 'SET_SESSIONS', payload: data });
                // Initialize all profiles as collapsed
                const initialCollapseState = data.reduce((acc, profile) => {
                    acc[profile._id] = true;  // All profiles collapsed
                    return acc;
                }, {});
                // setProfiles(data)
                setCollapsedProfiles(initialCollapseState);
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

    const toggleProfileCollapse = (profileId) => {
        setCollapsedProfiles((prev) => ({
            ...prev,
            [profileId]: !prev[profileId]
        }));
    };

    const handleProfileClick = (profile) => {
        setSelectedProfileId(profile._id);
        onProfileSelect && onProfileSelect(profile);
        toggleProfileCollapse(profile._id)
    };

    useEffect(() => {

        socket.on('selectedProfileToNull', () => {
            setSelectedProfileId(false); // Show group discussion UI
        });


        // Cleanup listener when the component unmounts
        return () => {

            socket.off('selectedProfileToNull');
        }
        
    }, [socket])


    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className='profiles-outer-contianer'>
            <div className='title-profiles'>

                <h2>Profiles</h2>
            </div>
            <form className="container-input-add-new-profile" onSubmit={saveNewProfile}>
                <div className='container-button-text'>
                    <input
                        type="text"
                        value={titleOfProfile}
                        onChange={(e) => setTitleOfProfile(e.target.value)}
                        placeholder="Title of the Profile"
                        className='input-add-new-profile'
                    />
                    <button type="submit">Add</button>

                </div>
                <textarea
                    type="text"
                    value={descriptionOfProfile}
                    onChange={(e) => setdescriptionOfProfile(e.target.value)}
                    placeholder="Description of the Profile"
                    className='input-add-new-profile-description'
                />
            </form>
            <ul className="profile-list">
                {sessions.map((profile) => (
                    <motion.li key={profile._id}
                        className={`profile-card ${selectedProfileId === profile._id ? 'selected' : ''}`}
                        onClick={() => handleProfileClick(profile)}

                    >
                        <div className="profile-header" onClick={() => onProfileSelect && onProfileSelect(profile)} >
                            <h3>{profile.name}</h3>
                        </div>
                        <AnimatePresence>
                            {!collapsedProfiles[profile._id] && (
                                <motion.div
                                    className="profile-details"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <p>{profile.options.en}</p>
                                    <button onClick={() => deleteProfile(profile._id)}>Delete</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.li>
                ))}
            </ul>
        </div>
    );
};

export default CreateNewProfiles;

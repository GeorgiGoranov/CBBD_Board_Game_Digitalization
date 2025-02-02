import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { motion, AnimatePresence } from 'framer-motion';
import "../../SCSS/addnewcompetency.scss"


const AddNewCompetency = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [subcategoryName, setSubcategoryName] = useState('');
    const [translations, setTranslations] = useState({ nl: '', de: '', en: '' });
    const [successMessage, setSuccessMessage] = useState(''); // New state for success message
    const [showConfirmation, setShowConfirmation] = useState(false); // State for popup
    const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/cards/get-all-categories`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                const formattedCategories = data.map((category) => ({
                    value: category.category,
                    label: category.category,
                }));
                setCategories(formattedCategories);
            } else {
                console.error('Error fetching categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Handle new subcategory submission
    const handleSubmitSubcategory = async () => {
        if (!subcategoryName.trim() || !translations.nl.trim() || !translations.de.trim() || !translations.en.trim()) {
            alert('Please fill in all fields!');
            return;
        }

        try {
            const payload = {
                category: selectedCategory.value,
                subcategory: {
                    name: subcategoryName,
                    options: translations,
                },
            };

            // Send POST request to add new subcategory
            const response = await fetch(`${apiUrl}/api/cards/add-new-subcategory`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setSuccessMessage('Subcategory added successfully!');  // Set success message
                // Reset form fields
                setSubcategoryName('');
                setTranslations({ nl: '', de: '', en: '' });
                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                console.error('Error adding subcategory');
            }
        } catch (error) {
            console.error('Error adding subcategory:', error);
        }
    };

    // Handle new subcategory confirmation
    const handleAddSubcategory = () => {
        if (!subcategoryName.trim() || !translations.nl.trim() || !translations.de.trim() || !translations.en.trim()) {
            alert('Please fill in all fields!');
            return;
        }
        setShowConfirmation(true); // Show the confirmation popup
    };

    const handleConfirm = () => {
        setShowConfirmation(false);
        handleSubmitSubcategory(); // Proceed with the submission
    };

    const handleCancel = () => {
        setShowConfirmation(false);
    };

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div>
            <h2>Add New Competency</h2>
            <label htmlFor="category-select">Select Category:</label>
            <Select
                id="category-select"
                options={categories}
                value={selectedCategory}
                onChange={(selectedOption) => setSelectedCategory(selectedOption)}
                placeholder="-- Select a Category --"
            />

            {selectedCategory && (
                <div className="add-subcategory-form">
                    <h3>Add Subcategory to: {selectedCategory.label}</h3>

                    <label htmlFor="subcategory-name">Subcategory Name:</label>
                    <input
                        id="subcategory-name"
                        type="text"
                        value={subcategoryName}
                        onChange={(e) => setSubcategoryName(e.target.value)}
                        placeholder="Enter subcategory name"
                    />

                    <label htmlFor="translation-nl">Dutch Translation (nl):</label>
                    <input
                        id="translation-nl"
                        type="text"
                        value={translations.nl}
                        onChange={(e) => setTranslations((prev) => ({ ...prev, nl: e.target.value }))}
                        placeholder="Enter Dutch translation"
                    />

                    <label htmlFor="translation-de">German Translation (de):</label>
                    <input
                        id="translation-de"
                        type="text"
                        value={translations.de}
                        onChange={(e) => setTranslations((prev) => ({ ...prev, de: e.target.value }))}
                        placeholder="Enter German translation"
                    />

                    <label htmlFor="translation-en">English Translation (en):</label>
                    <input
                        id="translation-en"
                        type="text"
                        value={translations.en}
                        onChange={(e) => setTranslations((prev) => ({ ...prev, en: e.target.value }))}
                        placeholder="Enter English translation"
                    />

                    <button onClick={handleAddSubcategory}>Add Subcategory</button>
                    {successMessage && <div className="success">{successMessage}</div>}
                </div>
            )}

            {/* Confirmation Popup */}
            <AnimatePresence>
                {showConfirmation && (
                    <motion.div
                        className="confirmation-popup"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="popup-content">
                            <h4>Confirm Addition</h4>
                            <p>Please confirm the information below before adding the subcategory:</p>
                            <div className="popup-details">
                                <p><strong>Category:</strong> {selectedCategory.label}</p>
                                <p><strong>Subcategory Name:</strong> {subcategoryName}</p>
                                <p><strong>Translations:</strong></p>
                                <ul>
                                    <li><strong>NL:</strong> {translations.nl}</li>
                                    <li><strong>DE:</strong> {translations.de}</li>
                                    <li><strong>EN:</strong> {translations.en}</li>
                                </ul>
                            </div>
                            <div className="popup-buttons">
                                <button onClick={handleSubmitSubcategory}>Yes, Add</button>
                                <button onClick={() => setShowConfirmation(false)}>Cancel</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddNewCompetency;

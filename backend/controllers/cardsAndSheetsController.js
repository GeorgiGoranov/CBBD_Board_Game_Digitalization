
const createCards = (CardModel) => {
    return async (req, res) => {
        try {
            const { category, options, role } = req.body;
            const host = "dflt"; //req.user.id; 

            const cardExists = await CardModel.findOne({ category: category });
            if (cardExists) {
                return res.status(400).json({ message: 'Card with this category already exists!' });
            }

            const newCard = new CardModel({
                category,
                options: {
                    nl: options.nl,
                    de: options.de
                },
                role,
                host,
            });

            await newCard.save();
            res.status(201).json({ message: 'New Card created!', category, options, role, host });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating card' });
        }
    };
};

const getOneCardPerCategory = (CardModel, RoundModel) => {
    return async (req, res) => {
        try {
            // 1) Grab roomId from query (or from req.body if you prefer)
            const { roomId } = req.params;

            if (!roomId) {
                return res.status(400).json({ message: 'roomId is required' });
            }

            // 2) Find the round doc to see which subcategories are already used
            const round = await RoundModel.findOne({ roomId });
            const usedSet = new Set();
            // This will store something like "category|subcategoryName"

            if (round && round.cards && round.cards.length > 0) {
                for (const c of round.cards) {
                    const cat = c.card.category;
                    const subcat = c.card.subcategory;
                    usedSet.add(`${cat}||${subcat}`);
                }
            }

            // 3) Fetch all categories from the CardModel
            //    We'll do a normal find (or .find({}) to get everything)
            //    Then remove subcategories that were used
            const allCards = await CardModel.find({}).lean();


            const possiblePicks = [];
            for (const doc of allCards) {
                const { category, subcategories } = doc;

                // remove subcategories that are used
                const filteredSubcats = subcategories.filter(sc => {
                    const uniqueKey = `${category}||${sc.name}`;
                    return !usedSet.has(uniqueKey);
                });

                // for each still-available subcategory, push a "pick" object
                filteredSubcats.forEach(sc => {
                    possiblePicks.push({
                        category,
                        subcategory: sc.name,
                        options: sc.options,
                    });
                });
            }

            // 5) If no possible subcategories left, return 404 or similar
            if (possiblePicks.length === 0) {
                return res.status(200).json({
                    message: 'These were all the cards. Thank you for playing!'
                });
            }

            // 6) Randomly pick from possiblePicks
            const randomIndex = Math.floor(Math.random() * possiblePicks.length);
            const randomPick = possiblePicks[randomIndex];

            // 7) Send it back
            return res.status(200).json({
                category: randomPick.category,
                subcategory: randomPick.subcategory,
                options: randomPick.options,
            });
        } catch (error) {
            console.error('Error fetching random card', error);
            res.status(500).json({ message: 'Error fetching random card', error: error.message });
        }
    };
};

const getAllCategories = (models) => {
    return async (req, res) => {
        try {
            // Use Promise.all to fetch categories from all models concurrently
            const categoryResults = await Promise.all(
                models.map(model => model.distinct('category'))
            );

            // Flatten and remove duplicates
            const uniqueCategories = [...new Set(categoryResults.flat())].map(category => ({ category }));

            // Send the combined list of categories in the response
            res.status(200).json(uniqueCategories);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching categories', error: error.message });
        }
    };
};

const getAllCards = (models) => {
    return async (req, res) => {
        try {
            // Fetch categories and subcategories
            const categoryResults = await Promise.all(
                models.map(model => model.find({}, { _id: 0, category: 1, subcategories: 1 }))
            );

            // Combine results from all models
            const combinedCategories = categoryResults.flat();

            // Send the structured categories and subcategories in the response
            res.status(200).json(combinedCategories);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching cards', error: error.message });
        }
    };
};

const getAllDefaultProfiles = (model) => {
    return async (req, res) => {
        try {
            // Fetch all documents from the provided model
            const profiles = await model.find();

            // Send the data as a response
            res.status(200).json(profiles);
        } catch (error) {
            console.error("Error fetching profiles:", error);

            // Send an error response
            res.status(500).json({ message: "Failed to fetch profiles", error });
        }
    }
}

const createProfile = (model) => {
    return async (req, res) => {
        try {
            const { name, options } = req.body;

            // Validate request data
            if (!name || !options || !options.en) {
                return res.status(400).json({ message: "Invalid data. 'name' and 'options.en' are required." });
            }

            // Create and save the new profile
            const newProfile = new model({
                name,
                options
            });

            await newProfile.save();

            // Send the saved profile as a response
            res.status(201).json(newProfile);
        } catch (error) {
            console.error('Error creating profile:', error);
            res.status(500).json({ message: "Failed to create profile", error });
        }
    };
};


const deleteProfile = (model) => {
    return async (req, res) => {
        try {
            const { id } = req.params;  // Extract the profile ID from the request parameters

            // Find and delete the profile from the database
            const deletedProfile = await model.findByIdAndDelete(id);

            // If no profile is found, return a 404 error
            if (!deletedProfile) {
                return res.status(404).json({ message: 'Profile not found' });
            }

            // Return a success response
            res.status(200).json({ message: 'Profile deleted successfully', deletedProfile });
        } catch (error) {
            console.error('Error deleting profile:', error);
            res.status(500).json({ message: 'Failed to delete profile', error });
        }
    };
};

const addNewSubcategory = (models) => {
    return async (req, res) => {
        const { category, subcategory } = req.body;

        // Validate the request body
        if (!category || !subcategory || !subcategory.name || !subcategory.options) {
            return res.status(400).json({ message: 'Invalid data. Please provide a category, subcategory name, and options.' });
        }

        try {
            for (const model of models) {
                const existingDocument = await model.findOne({ category });

                if (existingDocument) {
                    // Check if the subcategory already exists
                    const subcategoryExists = existingDocument.subcategories.some(
                        (sub) => sub.name === subcategory.name
                    );

                    if (subcategoryExists) {
                        return res.status(400).json({ message: 'Subcategory already exists in this category.' });
                    }

                    // Add the new subcategory to the subcategories array
                    existingDocument.subcategories.push(subcategory);

                    // Save the updated document
                    const updatedDocument = await existingDocument.save();

                    return res.status(200).json({
                        message: 'Subcategory added successfully',
                        data: updatedDocument
                    });
                }
            }

            res.status(404).json({ message: 'Category not found in any model' });
        } catch (error) {
            console.error('Error adding subcategory:', error);
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    };
};


module.exports = {
    createCards,
    getOneCardPerCategory,
    getAllCategories,
    getAllCards,
    getAllDefaultProfiles,
    createProfile,
    deleteProfile,
    addNewSubcategory
};

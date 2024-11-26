
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

const getOneCardPerCategory = (CardModel) => {
    return async (req, res) => {
        try {
            // Fetch all distinct categories
            const categories = await CardModel.distinct('category');
            if (!categories || categories.length === 0) {
                return res.status(404).json({ message: 'No categories found' });
            }

            // Randomly pick one category
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];

            // Find one random card within the selected category
            const card = await CardModel.findOne({ category: randomCategory }).select('category subcategories').lean();

            if (!card || !card.subcategories || card.subcategories.length === 0) {
                return res.status(404).json({ message: 'No subcategories found for this category' });
            }

            // Randomly pick one subcategory
            const randomIndex = Math.floor(Math.random() * card.subcategories.length);
            const selectedSubcategory = card.subcategories[randomIndex];

            // Send the selected subcategory as the response
            res.status(200).json({
                category: card.category,
                subcategory: selectedSubcategory.name,
                options: selectedSubcategory.options,
            });
        } catch (error) {
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


module.exports = {
    createCards,
    getOneCardPerCategory,
    getAllCategories,
    getAllCards
};

const CardModel = require('../models/CardModel')

const createCards = async (req, res) => {
    try {
        const { category,options,role} = req.body

        const host = "dflt" //req.user.id // Get the host name from the request

        // Check if a card with the same category already exists
        const cardExists = await CardModel.findOne({ category: category });

        if (cardExists) {
            return res.status(400).json({ message: 'Card with this category already exists!' });
        }
        // Create a new card in the database
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

        // Respond with the new card data
        res.status(201).json({
            category,
            options: {
                nl: options.nl,
                de: options.de
            },
            role,
            host,
            message: 'New Card created!'
        });

    } catch (error) {
        console.error(error); // Log the actual error for debugging
        res.status(500).json({ message: 'Error creating card' });
    }
}

// Fetch one card per subcategory within each category
const getOneCardPerCategory = async (req, res) => {
   try {
        // Fetch all unique categories
        const categories = await CardModel.distinct('category');

        // Find one subcategory for each category
        const cards = await Promise.all(
            categories.map(async (category) => {
                // Find the first card that belongs to this category
                const card = await CardModel.findOne({ category }).select('category subcategories').lean();

                if (!card || !card.subcategories || card.subcategories.length === 0) return null;

                 // Select a random subcategory from the list
                const randomIndex = Math.floor(Math.random() * card.subcategories.length);
                // Select the first subcategory (or randomize by replacing 0 with Math.floor(Math.random() * card.subcategories.length))
                const selectedSubcategory = card.subcategories[randomIndex];

                return {
                    category: card.category,
                    subcategory: selectedSubcategory.name,
                    options: selectedSubcategory.options
                };
            })
        );

        // Filter out any null entries in case some categories have no subcategories
        const filteredCards = cards.filter(Boolean);

        res.status(200).json(filteredCards);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cards', error: error.message });
    }
};



module.exports = {
    createCards,
    getOneCardPerCategory
}
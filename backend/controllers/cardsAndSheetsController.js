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


module.exports = {
    createCards
}
const CardModel = require('../models/CardModel')

const createCards = async (req, res) => {
    try {
        const { name,role} = req.body

        const host = req.user.id // Get the host name from the request

        do {
            cardExists = await CardModel.findOne({ name: name })
        } while (cardExists) // Ensure that the code is unique

        // Create a new game session in the database
        const newCard = new CardModel({
            name: name,
            role: role,
            host: host
        });

        await newCard.save();
        /*adding the additional values the responce so that 
        when the web context/hook is triggered can take the unfo
         and filled in without having to make a call to the DB
        */
        res.status(201).json({ name: name ,role: role,host: host, message: 'New Card created!' });

    } catch (error) {
        res.status(500).json({ message: 'Error creating card' });
    }
}


module.exports = {
    createCards
}
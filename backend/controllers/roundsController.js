const FirstRound = require('../models/FirstRoundModel')


const saveRoomState = async (req, res) => {
    const { roomId, categories, dropZones } = req.body; 

    try {
        // Check if the room already exists
        let round = await FirstRound.findOne({ roomId });

        if (round) {
            // If the room exists, update its state
            round.categories = categories;
            round.dropZones = dropZones;
        } else {
            // If the room doesn't exist, create a new one
            round = new FirstRound({
                roomId,
                categories,
                dropZones,
            });
        }

        // Save the updated or new room state to the database
        await round.save();
        res.status(200).json({ message: 'Room state saved successfully' });
    } catch (error) {
        console.error('Error saving room state:', error);
        res.status(500).json({ message: 'Error saving room state', error: error.message });
    }
};

const getRoomState = async (req, res) => {
    const { roomId } = req.params;
    try {
        // Find the room by roomId
        const room = await FirstRound.findOne({ roomId });

        if (room) {
            res.status(200).json(room); // Send the room state if found
        } else {
            res.status(404).json({ message: 'Room state not found' });
        }
    } catch (error) {
        console.error('Error fetching room state:', error);
        res.status(500).json({ message: 'Error fetching room state', error: error.message });
    }
};


module.exports = {
    saveRoomState,
    getRoomState

}

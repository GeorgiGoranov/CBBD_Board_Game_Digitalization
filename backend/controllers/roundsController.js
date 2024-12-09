
const sanitizeHtml = require('sanitize-html');
const ChatRoom = require('../models/ChatModel')

const saveRoomStateMode = (RoundModel) => {
    return async (req, res) => {
        const { roomId, categories, dropZones } = req.body;
        try {
            // Check if the room already exists
            let round = await RoundModel.findOne({ roomId });

            if (round) {
                // If the room exists, update its state
                round.categories = categories;
                round.dropZones = dropZones;

            } else {
                // If the room doesn't exist, create a new one
                round = new RoundModel({
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
    }

};

const saveThirdRoomStateMode = (RoundModel) => {
    return async (req, res) => {
        const { roomId, card, vote, playerID } = req.body;

        try {
            // Find the room by roomId
            let round = await RoundModel.findOne({ roomId });

            if (!round) {
                // If room doesn't exist, create it
                round = new RoundModel({ roomId, cards: [] });
            }

            if (card) {

                // Add the new card with initial votes
                const newCard = {
                    card: card,
                    votes: {
                        agree: { count: 0, playerID: [] },
                        disagree: { count: 0, playerID: [] },
                    },
                };
                round.cards.push(newCard);

            }

            if (vote === 'agree' || vote === 'disagree') {
                // Ensure there is at least one card to vote on
                if (round.cards.length === 0) {
                    return res.status(400).json({ message: 'No card available to vote on' });
                }

                // Get the latest card
                const lastCard = round.cards[round.cards.length - 1];

                // Update the vote counts and player IDs
                lastCard.votes[vote].count += 1;
                lastCard.votes[vote].playerID.push(playerID);
            } else if (vote) {
                // Invalid vote option provided
                return res.status(400).json({ message: 'Invalid vote option' });
            }


            // Save the updated room state to the database
            await round.save();
            res.status(200).json({ message: 'Room state saved successfully' });
        } catch (error) {
            console.error('Error saving room state:', error);
            res.status(500).json({ message: 'Error saving room state', error: error.message });
        }
    };
};


const getRoomStateMode = (RoundModel) => {
    return async (req, res) => {
        const { roomId } = req.params;
        console.log('Using model:', RoundModel.modelName); // Log the model name
        console.log('Received roomId:', roomId); // Log the roomId
        try {
            // Find the room by roomId`
            const room = await RoundModel.findOne({ roomId });

            if (room) {

                res.status(200).json(room); // Send the room state if found
            } else {
                res.status(404).json({ message: 'Room state not found' });
            }
        } catch (error) {
            console.error('Error fetching room state:', error);
            res.status(500).json({ message: 'Error fetching room state', error: error.message });
        }
    }

};

const saveMessage = async (messagesData) => {
    const { roomId, sender, message } = messagesData;
    // Sanitize the message text
    const sanitizedText = sanitizeHtml(message);

    try {
        // Find the chat room document by roomId
        let chatRoom = await ChatRoom.findOne({ roomId });

        if (!chatRoom) {
            // If no chat room exists, create a new one
            chatRoom = new ChatRoom({
                roomId,
                messages: [],
            });
        }

        // Create a new message object
        const newMessage = {
            sender,
            message: sanitizedText,
        };

        // Add the new message to the messages array
        chatRoom.messages.push(newMessage);

        // Save the chat room document
        await chatRoom.save();

        return { success: true, message: newMessage };
    } catch (error) {
        console.error('Error saving message:', error);
        return { success: false, error: error.message };
    }
};

const getMessage = async (req, res) => {
    const { roomId } = req.params;

    try {
        // Find the chat room by roomId and return only the messages array
        const chatRoom = await ChatRoom.findOne({ roomId }, { messages: 1, _id: 0 });

        if (!chatRoom) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Send only the messages array
        res.json({ messages: chatRoom.messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

// const getThirdRoomStateMode = (RoundModel) => {
//     return async (req, res) => {
//         const { roomId } = req.params;

//         try {
//             // Find the room by roomId
//             const round = await RoundModel.findOne({ roomId });

//             if (!round) {
//                 return res.status(404).json({ message: 'Room not found' });
//             }

//             res.status(200).json(round);
//         } catch (error) {
//             console.error('Error fetching room state:', error);
//             res.status(500).json({ message: 'Error fetching room state', error: error.message });
//         }
//     }

// };


module.exports = {
    getRoomStateMode,
    saveMessage,
    getMessage,
    saveRoomStateMode,
    saveThirdRoomStateMode,
    // getThirdRoomStateMode

}

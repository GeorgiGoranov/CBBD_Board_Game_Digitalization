
const sanitizeHtml = require('sanitize-html');
const ChatRoom = require('../models/ChatModel')

// const saveRoomState = async (req, res) => {

//     const { roomId, categoriesData, dropZones } = req.body;
//     try {
//         // Check if the room already exists
//         let round = await FirstRound.findOne({ roomId });

//         if (round) {
//             // If the room exists, update its state
//             round.categoriesData = categoriesData;
//             round.dropZones = dropZones;
//         } else {
//             // If the room doesn't exist, create a new one
//             round = new FirstRound({
//                 roomId,
//                 categoriesData,
//                 dropZones,
//             });
//         }

//         // Save the updated or new room state to the database
//         await round.save();
//         res.status(200).json({ message: 'Room state saved successfully' });
//     } catch (error) {
//         console.error('Error saving room state:', error);
//         res.status(500).json({ message: 'Error saving room state', error: error.message });
//     }
// };


const saveRoomStateMode = (RoundModel) => {
    return async (req, res) => {
        const { roomId, categoriesData, dropZones } = req.body;
        try {
            // Check if the room already exists
            let round = await RoundModel.findOne({ roomId });

            if (round) {
                // If the room exists, update its state
                round.categories = categoriesData;
                round.dropZones = dropZones;
            } else {
                // If the room doesn't exist, create a new one
                round = new RoundModel({
                    roomId,
                    categoriesData,
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

const getRoomStateMode = (RoundModel) => {
    return async (req,res) =>{
        const { roomId } = req.params;
        try {
            // Find the room by roomId
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


module.exports = {
    getRoomStateMode,
    saveMessage,
    getMessage,
    saveRoomStateMode

}

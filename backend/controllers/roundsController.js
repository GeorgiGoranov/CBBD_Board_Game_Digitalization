
const sanitizeHtml = require('sanitize-html');
const ChatRoom = require('../models/ChatModel')


const saveRoomStateMode = (RoundModel) => {
    return async (req, res) => {
        const { roomId, groups } = req.body;

        if (!Array.isArray(groups)) {
            return res.status(400).json({ message: 'groups must be an array' });
        }

        try {
            // Check if the room already exists
            let round = await RoundModel.findOne({ roomId });

            if (round) {
                // If the room exists, we merge or update groups
                for (const newGroup of groups) {
                    const existingGroupIndex = round.groups.findIndex(
                        (g) => g.groupNumber === newGroup.groupNumber
                    );

                    if (existingGroupIndex !== -1) {
                        // Update the existing group's details
                        round.groups[existingGroupIndex].categories = newGroup.categories;
                        round.groups[existingGroupIndex].dropZones = newGroup.dropZones;

                        // For messages, you can either replace them or append:
                        // Replace existing messages:
                        // round.groups[existingGroupIndex].messages = newGroup.messages;

                        // Or append new messages to existing:
                        if (Array.isArray(newGroup.messages)) {
                            round.groups[existingGroupIndex].messages = [
                                ...round.groups[existingGroupIndex].messages,
                                ...newGroup.messages
                            ];
                        }
                    } else {
                        // Add the new group if it doesn't exist
                        round.groups.push(newGroup);
                    }
                }
            } else {
                // If the room doesn't exist, create a new one
                round = new RoundModel({
                    roomId,
                    groups,
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
                // Add a new card to the array with empty votes object
                const newCard = {
                    card: card,
                    votes: {}, // Start with no votes
                };
                round.cards.push(newCard);
            }

            if (vote) {
                // Ensure there is at least one card to vote on
                if (round.cards.length === 0) {
                    return res.status(400).json({ message: 'No card available to vote on' });
                }

                // Get the latest card
                const lastCardIndex = round.cards.length - 1;
                const lastCard = round.cards[lastCardIndex];

                // Initialize vote data for this option if it doesn't exist
                if (!lastCard.votes[vote]) {
                    lastCard.votes[vote] = { count: 0, playerID: [] };
                }

                // Update the vote count and the list of player IDs who voted for this option
                lastCard.votes[vote].count += 1;
                lastCard.votes[vote].playerID.push(playerID);

                // Assign updated card back to the array (usually not strictly necessary)
                round.cards[lastCardIndex] = lastCard;
            }

            // Save the updated room state to the database
            await round.save();
            return res.status(200).json({ message: 'Room state saved successfully' });
        } catch (error) {
            console.error('Error saving room state:', error);
            return res.status(500).json({ message: 'Error saving room state', error: error.message });
        }
    };
};

module.exports = saveThirdRoomStateMode;



const getRoomStateMode = (RoundModel) => {
    return async (req, res) => {
        const { roomId } = req.params;
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
    const { roomId, sender, message, group } = messagesData;
    // Sanitize the message text
    const sanitizedText = sanitizeHtml(message);

    try {
        let chatRoom = await ChatRoom.findOne({ roomId });

        if (!chatRoom) {
            chatRoom = new ChatRoom({ roomId, groups: [] });
        }

        // Find or create the group
        let targetGroup = chatRoom.groups.find(g => g.groupNumber === Number(group));
        if (!targetGroup) {
            // If no group exists for this groupNumber, create it
            targetGroup = { groupNumber: Number(group), messages: [] };
            chatRoom.groups.push(targetGroup);
        }

        // Now push the new message into the target group
        targetGroup.messages.push({ sender, message: sanitizedText });

        await chatRoom.save();

        // Return the newly added message
        const newMessage = targetGroup.messages[targetGroup.messages.length - 1];
        return { success: true, message: { ...newMessage.toObject(), groupNumber: Number(group), roomId } };
    } catch (error) {
        console.error('Error saving message:', error);
        return { success: false, error: error.message };
    }
};

const getMessage = async (req, res) => {
    const { roomId } = req.params;
    const { group } = req.query;

    try {
        const chatRoom = await ChatRoom.findOne({ roomId });

        if (!chatRoom) {
            return res.status(404).json({ error: 'Room not found' });
        }

        if (group) {
            const targetGroup = chatRoom.groups.find(g => g.groupNumber === Number(group));
            const messages = targetGroup ? targetGroup.messages : [];
            return res.json({ messages });
        } else {
            // If no group is specified, you could return all messages from all groups,
            // or just return an empty array depending on your needs.
            // Here, we return all messages grouped by groupNumber.
            const allMessages = chatRoom.groups.reduce((acc, grp) => {
                acc.push({ groupNumber: grp.groupNumber, messages: grp.messages });
                return acc;
            }, []);
            return res.json({ groups: allMessages });
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

const getCurrentStateThirdRound = (RoundModel) => {
    return async (req, res) => {
        const { roomId } = req.params;

        try {
            // Find the room by roomId
            const room = await RoundModel.findOne({ roomId });

            if (room && room.cards.length > 0) {
                // Get the latest card (assuming the last element is the current one)
                const latestCardEntry = room.cards[room.cards.length - 1];
                const latestCard = latestCardEntry.card;
                const votes = latestCardEntry.votes;

                // Send only the latest card and votes
                res.status(200).json({
                    card: latestCard,
                    votes: votes,
                });
            } else {
                res.status(404).json({ message: 'No card found for this room' });
            }
        } catch (error) {
            console.error('Error fetching room state:', error);
            res.status(500).json({ message: 'Error fetching room state', error: error.message });
        }
    };
};


module.exports = {
    getRoomStateMode,
    saveMessage,
    getMessage,
    saveRoomStateMode,
    saveThirdRoomStateMode,
    getCurrentStateThirdRound

}

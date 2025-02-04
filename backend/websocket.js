const { Server } = require('socket.io');
const { saveMessage } = require('./controllers/roundsController');
require('dotenv').config()

 
// In-memory stores
const rooms = {};       // To keep track of players in rooms
const roomRounds = {};  // To keep track of current round per room
const roomVotes = {}; // Store votes per room: { [roomId]: { agree: number, disagree: number } }
const roomsReadiness = {};


// WebSocket setup
function setupWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: `${process.env.FRONT_END_URL_HOST}`,
      methods: ["GET", "POST"],
      credentials: true, // Enable credentials (cookies, authorization headers)
    }
  });

  io.on('connection', (socket) => {
    console.log(`User back-end initial connection: ${socket.id}`);

    // Handle when a player joins a session
    socket.on('joinSession', (data) => {

      const { playerID, nationality, gameCode, group } = data;

      // Add the player to the room's player list
      if (!rooms[gameCode]) {
        rooms[gameCode] = [];  // Create room if it doesn't exist
        roomRounds[gameCode] = 1; // Initialize round to 0 for new room
      }
      // Find if the player already exists (reconnecting with new socket.id)
      const existingPlayer = rooms[gameCode].find((player) => player.playerID === playerID);

      if (existingPlayer) {
        // Update the player's socketId to the new one (in case of reconnect)
        existingPlayer.socketId = socket.id;
        existingPlayer.group = group; // Update group if needed
      } else {
        // Add the new player to the room if not already present
        rooms[gameCode].push({ playerID, socketId: socket.id, nationality, group });
      }

      // Add the player to the specific room associated with the gameCode
      socket.join(gameCode);

      // Send the current round to the newly connected client
      socket.emit('roundChanged', { roundNumber: roomRounds[gameCode] });

      // Send the current round to the newly connected client
      socket.emit('changeDilemmaCard', { click: true });

      // Send the current vote counts to the newly connected client
      if (!roomVotes[gameCode]) {
        roomVotes[gameCode] = { agree: 0, disagree: 0 };
      }
      socket.emit('updateVotes', roomVotes[gameCode]);

      // Notify everyone in this specific room about the new player
      io.to(gameCode).emit('playerJoined', { playerID, nationality });
      // Notify everyone in this specific room with the updated player list
      io.to(gameCode).emit(
        'updatePlayerList',
        rooms[gameCode].map((player) => ({
          playerID: player.playerID,
          nationality: player.nationality,
          group: player.group
        }))
      );

      // Listen for when a participant becomes ready
      socket.on('playerReady', ({ roomId, playerID, group }) => {
        // If no readiness structure for room, create it
        if (!roomsReadiness[roomId]) {
          roomsReadiness[roomId] = {};
        }
        // If no readiness structure for group, create it
        if (!roomsReadiness[roomId][group]) {
          roomsReadiness[roomId][group] = {};
        }

        // Mark the player as ready
        roomsReadiness[roomId][group][playerID] = true;

        console.log(`Player ${playerID} in group ${group} of room ${roomId} is READY.`);

        // Check if entire group is ready
        const groupPlayers = rooms[roomId].filter(p => Number(p.group) === Number(group));
        const allReady = groupPlayers.every(p => roomsReadiness[roomId][group][p.playerID]);

        if (allReady) {
          console.log(`Group ${group} in room ${roomId} is fully READY!`);
          // Notify all clients in the room that this group is fully ready
          io.to(roomId).emit('groupFullyReady', { groupNumber: group });
        } else {
          // Optionally: broadcast partial readiness info
          // For example, how many are ready out of total
          const readyCount = groupPlayers.filter(p => roomsReadiness[roomId][group][p.playerID]).length;
          const totalCount = groupPlayers.length;

          io.to(roomId).emit('groupReadinessUpdate', {
            groupNumber: group,
            readyCount,
            totalCount,
          });
        }
      });
    });

    socket.on('navigateToRoom', (data) => {
      const { roomId } = data;
      console.log(`Navigating all players in room ${roomId} to game room`);

      // Broadcast the event to all players in the room
      io.to(roomId).emit('navigateToRoom', { roomId });
    });

    socket.on('updateTokens', ({ roomId, groupedPlayers }) => {
      // Broadcast the groupedPlayers data to all players in the room
      socket.to(roomId).emit('updateTokens', { groupedPlayers });
    });

    socket.on('sendGroupMessage', (data) => {
      const { roomId, groups, message } = data;

      if (!rooms[roomId]) return;

      // Ensure `groups` is an array
      const targetGroups = Array.isArray(groups) ? groups : [groups];

      // Loop through each group and send the message to its players
      targetGroups.forEach((group) => {
        const targetPlayers = rooms[roomId].filter(player => String(player.group) === String(group));
        targetPlayers.forEach(player => {
          io.to(player.socketId).emit('receiveGroupMessage', { message });
        });
      });

    });

    socket.on('dragDropUpdate', (data) => {
      const { gameCode, playerID } = data;

      const roomPlayers = rooms[gameCode] || [];
      const triggeringPlayer = roomPlayers.find(p => p.playerID === playerID);

      if (triggeringPlayer) {
        const playerGroup = triggeringPlayer.group;
        const targetPlayers = roomPlayers.filter(p => p.group === playerGroup);

        // Emit only to players in the same group
        targetPlayers.forEach(p => {
          io.to(p.socketId).emit('dragDropUpdate', data);
        });
      }
    });

    // Capture and broadcast cursor position
    socket.on('cursorMove', (data) => {
      const { x, y, playerID, gameCode, group } = data;
      // Broadcast the cursor position to all players in the room except the sender
      socket.to(gameCode).emit('cursorUpdate', { x, y, playerID, group });
    });

    socket.on('sendMessage', async (data) => {
      const { message } = data;

      const result = await saveMessage(message);

      if (result.success) {
        const { roomId, groupNumber } = result.message;

        // Find all players in this room with the same groupNumber
        const roomPlayers = rooms[roomId] || [];
        const targetPlayers = roomPlayers.filter(p => Number(p.group) === Number(groupNumber));
  
        targetPlayers.forEach((player) => {
          io.to(player.socketId).emit('receiveMessage', { message: result.message });
        });
      } else {
        socket.emit('errorMessage', { error: 'Could not save message' });
      }
    });


    socket.on('changeRound', (data) => {
      const { roomId, roundNumber } = data;
      // Update the current round for the room
      roomRounds[roomId] = roundNumber;

      // Clear readiness data for this room
      if (roomsReadiness[roomId]) {
        roomsReadiness[roomId] = {};  // Reset all readiness for the new round
        console.log(`Cleared readiness for room ${roomId} because round changed to ${roundNumber}`);
      }

      // Broadcast 'roundChanged' event to all clients in the room
      io.in(roomId).emit('roundChanged', { roundNumber });

      console.log(`Round changed to ${roundNumber} in room ${roomId}`);
    });

    socket.on('newDilemmaCardData', (data) => {
      const { roomId, card } = data;

      // 1. Reset the server-side votes for this room
      roomVotes[roomId] = { option1: 0, option2: 0 };

      // Broadcast the new card data to all users in the room
      io.to(roomId).emit('updateDilemmaCardData', card);

      // 3. Broadcast the reset counts (optional, to ensure all clients see 0 immediately)
      io.to(roomId).emit('updateVotes', roomVotes[roomId]);

      console.log(`Broadcasted new dilemma card data for room: ${roomId}`);
    });

    socket.on('vote', (data) => {
      const { vote, roomId } = data;

      if (!roomVotes[roomId]) {
        // Initialize counters specifically as option1: 0, option2: 0
        roomVotes[roomId] = { option1: 0, option2: 0 };
      }

      // Increment vote count for the selected option
      if (!roomVotes[roomId][vote]) {
        roomVotes[roomId][vote] = 0;
      }
      roomVotes[roomId][vote] += 1;

      io.to(roomId).emit('updateVotes', roomVotes[roomId]); // Broadcast updated votes
    });

    // Handle resetting votes when a new dilemma card is selected
    socket.on('resetVotes', () => {
      // Reset the vote counts for this room
      roomVotes[roomId] = { option1: 0, option2: 0 };
      // Notify all clients with the updated votes
      io.to(roomId).emit('updateVotes', roomVotes[roomId]);
    });

    socket.on('stopGame', (data) => {
      const { roomId } = data;

      // Broadcast 'gameStopped' to all sockets in roomId
      io.to(roomId).emit('gameStopped');
    });

    socket.on('sendFeedbackGroupMessage', ({ roomId, group, message }) => {

      if (!rooms[roomId]) return;


      const targetPlayers = rooms[roomId].filter(player => String(player.group) === String(group));

      targetPlayers.forEach(player => {
        io.to(player.socketId).emit('receiveFeedbackGroupMessage', { message }); 
      });
    }); 

    socket.on('startGroupDiscussion', ({ roomId }) => {
      io.to(roomId).emit('groupDiscussionStarted', { message: 'Group discussion has started.' });
    });

    socket.on('endGroupDiscussion', ({ roomId }) => {
      io.in(roomId).emit('groupDiscussionEnded', { message: 'Group discussion has ended. Proceeding to the next round.' });
    });

    // Listen for group change events from clients
    socket.on('groupChange', (newGroupNumber) => {
      console.log(`Group change to: ${newGroupNumber} by ${socket.id}`);
      // Broadcast the new group number to all connected clients
      io.emit('nextGroupUnderDiscussion', newGroupNumber);
    });

    socket.on('sendProfileToGroups', ({ roomId, profile, groups }) => {
      if (!rooms[roomId]) return;

      const targetGroups = Array.isArray(groups) ? groups : [groups];

      // Find the profile data (if needed)
      // You might need a separate function to get the profile details from your database
      const profileData = { profile }; // Example data

      console.log(profile)

      // Loop through each group and send the profile data to its players
      targetGroups.forEach((group) => {
        const targetPlayers = rooms[roomId].filter(player => String(player.group) === String(group));
        targetPlayers.forEach(player => {
          io.to(player.socketId).emit('receiveProfileData', profileData);
        });
      });
    });

    socket.on('setSelectedProfileToNull', ()=>{
      io.emit('selectedProfileToNull');
    })

    socket.on('disconnect', () => {
      console.log(`User back-end disconnected: ${socket.id}`);

      let roomCode = null;
      let playerID = null;

      // Find the player in each room by matching the socketId
      for (const room in rooms) {
        const playerIndex = rooms[room].findIndex((p) => p.socketId === socket.id);

        if (playerIndex !== -1) {
          // Get the playerID of the player being removed
          playerID = rooms[room][playerIndex].playerID;
          rooms[room].splice(playerIndex, 1);  // Remove player from the room
          roomCode = room;
          break;  // Exit the loop once the player is found
        }
      }

      if (roomCode) {
        // Emit the updated player list to everyone in the room with full player details
        io.to(roomCode).emit(
          'updatePlayerList',
          rooms[roomCode].map(player => ({
            playerID: player.playerID,
            nationality: player.nationality, 
            group: player.group
          }))
        );

        // Then emit the playerLeftRoom event for the message
        io.to(roomCode).emit('playerLeftRoom', playerID);

        console.log(`${playerID} left room: ${roomCode}`);
      }
    });

  });

  return io;
}

module.exports = setupWebSocket;

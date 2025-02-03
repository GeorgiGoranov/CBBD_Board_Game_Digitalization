import { io } from 'socket.io-client';

let socket;
const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;

const initSocket = () => {
  if (!socket) {
    // Initialize the WebSocket connection with autoConnect disabled
    socket = io(`${apiUrl}`, {
      transports: ['websocket'], // Prevents auto connection when imported
    });

    // Add logging to track connection and disconnection
    socket.on('connect', () => {
      console.log(`WebSocket connected with ID: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
  }
  return socket;
};

export default initSocket;

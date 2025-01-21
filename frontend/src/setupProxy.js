const { createProxyMiddleware } = require('http-proxy-middleware');
const API_URL = process.env.REACT_APP_BACKEND_URL;


module.exports = function(app) {
    console.log("Proxy middleware is running!");
  app.use(
    '/api',
    createProxyMiddleware({
      target: `${API_URL}`,  // Your backend server URL
      changeOrigin: true,
      credentials: 'include'
    })
  );

   // Proxy WebSocket requests for Socket.io
   app.use(
    '/socket.io',  // WebSocket connections handled here
    createProxyMiddleware({
      target: `${API_URL}`,  // Backend server URL
      changeOrigin: true,
      ws: true,  // Enable WebSocket proxying
    })
  );

};

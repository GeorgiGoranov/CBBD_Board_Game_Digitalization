const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    console.log("Proxy middleware is running!");
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:4000/api',  // Your backend server URL
      changeOrigin: true,
      credentials: 'include'
    })
  );

   // Proxy WebSocket requests for Socket.io
   app.use(
    '/socket.io',  // WebSocket connections handled here
    createProxyMiddleware({
      target: 'http://localhost:4000',  // Backend server URL
      changeOrigin: true,
      ws: true,  // Enable WebSocket proxying
    })
  );

};

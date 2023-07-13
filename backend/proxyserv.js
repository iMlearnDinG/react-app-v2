const express = require('express');
const httpProxy = require('http-proxy');
const path = require('path');
require('dotenv').config({ path: "C:\\Users\\User\\PycharmProjects\\react-app-v2\\.env" });

const app = express();
const proxyScript = httpProxy.createProxyServer();

// Backend server configuration
const backendPort = process.env.SERVER_PORT; // Update with your backend server port
const backendUrl = `http://localhost:${backendPort}`;

// Frontend server configuration
const frontendPort = 3000; // Update with your frontend server port
const frontendUrl = `http://localhost:${frontendPort}`;

// Proxy API requests to the backend server
app.use('/api', (req, res) => {
  console.log(`New connection through /api to ${backendUrl}`);
  proxyScript.web(req, res, { target: backendUrl });
});

// Proxy all other requests to the frontend server
app.use((req, res) => {
  console.log(`New connection to frontend: ${frontendUrl}`);
  proxyScript.web(req, res, { target: frontendUrl });
});

// Error handling for the proxyScript server
proxyScript.on('error', (err, req, res) => {
  console.error('Proxy Error:', err);
  if (!res.headersSent) {
    res.status(500).send('Proxy Error');
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
const port = process.env.PROXY_PORT; // Choose a port number for the reverse proxy server
app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});

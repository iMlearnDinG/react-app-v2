const express = require('express');
const httpProxy = require('http-proxy');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: "C:\\codeProjects\\react-app-v2\\.env" });

const bunyan = require('bunyan');
const log = bunyan.createLogger({
  name: 'react-proxy',
  streams: [
    {
      level: 'info',
      path: 'C:\\logs\\proxy.txt'  // log INFO and above to a file
    }
  ]
});

const app = express();
const proxyScript = httpProxy.createProxyServer();

// Backend server configuration
const backendPort = process.env.REACT_APP_SERVER_PORT;
const backendUrl = `${process.env.REACT_APP_CORS_ORIGIN}:${backendPort}`;

// Frontend server configuration
const frontendPort = 3000;
const frontendUrl = `${process.env.REACT_APP_CORS_ORIGIN}:${frontendPort}`;

// SSL/TLS certificate and private key paths
const sslKeyPath = "C:\\codeProjects\\react-app-v2\\ssl\\private.key";
const sslCertPath = "C:\\codeProjects\\react-app-v2\\ssl\\certificate.crt";
const sslOptions = {
  key: fs.readFileSync(sslKeyPath),
  cert: fs.readFileSync(sslCertPath),
};

// Proxy API requests to the backend server
app.all('/api/*', (req, res) => {
  log.info(`New connection through /api to ${backendUrl}`);
  proxyScript.web(req, res, { target: backendUrl });
});

// Proxy all other requests to the frontend server
app.all('*', (req, res) => {
  log.info(`New connection to frontend: ${frontendUrl}`);
  proxyScript.web(req, res, { target: frontendUrl });
});

// Error handling for the proxyScript server
proxyScript.on('error', (err, req, res) => {
  log.error({ err }, 'Proxy Error');
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Proxy Error',
      details: {
        errno: err.errno,
        code: err.code,
        syscall: err.syscall,
        address: err.address,
        port: err.port,
      }
    });
  }
});

// Start the HTTPS server
const port = process.env.REACT_APP_PROXY_PORT;
https.createServer(sslOptions, app).listen(port, () => {
  log.info(`Proxy server running on port ${port}`);
});

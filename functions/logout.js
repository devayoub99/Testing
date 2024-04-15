// functions/logout.js
const express = require('express');
const serverless = require('serverless-http');

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with your frontend domain
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.post('/.netlify/functions/logout', (req, res) => {
  // Perform any necessary cleanup on the server side
  // For example, revoke tokens or update session status

  console.log('Logout successful');
  res.status(200).json({ message: 'Logout successful' });
});

module.exports = app;
module.exports.handler = serverless(app);

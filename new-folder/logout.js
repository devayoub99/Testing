// functions/logout.js
const express = require('express');
const serverless = require('serverless-http');

const app = express();

app.post('/.netlify/functions/logout', (req, res) => {
  // Your logout route logic here
});

module.exports = app;
module.exports.handler = serverless(app);

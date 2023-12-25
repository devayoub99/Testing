// functions/register.js
const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const app = express();
app.use(bodyParser.json());

app.post('/.netlify/functions/register', async (req, res) => {
  // Your registration route logic here
});

module.exports = app;
module.exports.handler = serverless(app);

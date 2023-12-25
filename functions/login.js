// functions/login.js
const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
app.use(bodyParser.json());

app.post('/.netlify/functions/login', async (req, res) => {
  // Your login route logic here
});

module.exports = app;
module.exports.handler = serverless(app);

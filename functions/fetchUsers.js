// functions/fetchUsers.js
const express = require('express');
const serverless = require('serverless-http');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.get('/.netlify/functions/fetchUsers', async (req, res) => {
  // Your fetch users route logic here
});

module.exports = app;
module.exports.handler = serverless(app);

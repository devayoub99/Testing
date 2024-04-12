// functions/createProduct.js
const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(bodyParser.json());

app.post('/.netlify/functions/createProduct', async (req, res) => {
  // Your create product route logic here
});

module.exports = app;
module.exports.handler = serverless(app);

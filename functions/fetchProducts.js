// functions/fetchProducts.js
const express = require('express');
const serverless = require('serverless-http');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.get('/.netlify/functions/fetchProducts', async (req, res) => {
  // Your fetch products route logic here
});

module.exports = app;
module.exports.handler = serverless(app);

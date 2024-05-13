// functions/fetchCompanies.js

const express = require('express');
const serverless = require('serverless-http');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/.netlify/functions/fetchCompanies', async (req, res) => {
  try {
    const companies = await prisma.company.findMany();
    res.status(200).json(companies);
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

module.exports = app;
module.exports.handler = serverless(app);

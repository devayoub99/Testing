// functions/fetchOneCompany.js
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

app.get('/.netlify/functions/fetchOneCompany', async (req, res) => {
  try {
    const companyId = req.headers.id;
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    res.status(200).json(company);
  } catch (error) {
    console.error('Failed to fetch company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

module.exports = app;
module.exports.handler = serverless(app);

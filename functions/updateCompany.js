// functions/updateCompany.js
const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(bodyParser.json());

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with your frontend domain
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.patch('/.netlify/functions/updateCompany/:id', async (req, res) => {
  const companyId = req.params.id;
  const { action } = req.body;

  let updateData = {};
  if (action === 'approve') {
    updateData = { approved: true };
  } else if (action === 'freeze') {
    updateData = { frozen: req.body.frozen };
  } else if (action === 'hide') {
    updateData = { hidden: req.body.hidden };
  } else {
    return res.status(400).json({ error: 'Invalid action' });
  }

  try {
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });
    return res.status(200).json(updatedCompany);
  } catch (error) {
    console.error('Failed to update company:', error);
    return res.status(500).json({ error: 'Failed to update company' });
  }
});

module.exports = app;
module.exports.handler = serverless(app);

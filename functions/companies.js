const express = require('express');
const serverless = require('serverless-http');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.get('/.netlify/functions/companies/:status', async (req, res) => {
  const status = req.params.status;
  let filter;

  if (status === "approved") {
    filter = { approved: true };
  } else if (status === "frozen") {
    filter = { frozen: true };
  } else if (status === "hidden") {
    filter = { hidden: true };
  } else if (status === "active") {
    filter = { approved: true, hidden: false };
  } else {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  try {
    const companies = await prisma.company.findMany({
      where: filter,
    });
    res.status(200).json(companies);
  } catch (error) {
    console.error("Failed to fetch the Companies:", error);
    res.status(500).json({ error: "Failed to fetch the Companies" });
  }
});

module.exports = app;
module.exports.handler = serverless(app);

const express = require('express');
const serverless = require('serverless-http');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.get('/.netlify/functions/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  const userType = req.query.userType;
  try {
    let user;
    if (userType === "customer") {
      user = await prisma.customer.findUnique({
        where: { id: userId },
      });
    } else if (userType === "company") {
      user = await prisma.company.findUnique({
        where: { id: userId },
      });
    } else if (userType === "admin") {
      user = await prisma.admin.findUnique({
        where: { id: userId },
      });
    } else {
      return res.status(400).json({ error: "Invalid user type" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = app;
module.exports.handler = serverless(app);

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
  try {
    const { userType, username, email, password } = req.body;

    // Check if the email is already registered
    const existingUser = await prisma.customer.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user based on userType
    let newUser;
    if (userType === 'admin') {
      newUser = await prisma.admin.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });
    } else if (userType === 'company') {
      newUser = await prisma.company.create({
        data: {
          name: username,
          email,
          password: hashedPassword,
        },
      });
    } else if (userType === 'customer') {
      newUser = await prisma.customer.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });
    } else {
      return res.status(400).json({ error: 'Invalid userType.' });
    }

    return res.status(201).json({ message: 'Registration successful', user: newUser });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = app;
module.exports.handler = serverless(app);

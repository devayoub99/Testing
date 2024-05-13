const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const app = express();
app.use(bodyParser.json());

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with your frontend domain
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.post('/.netlify/functions/register', async (req, res) => {
  const {
    userType,
    username,
    email,
    password,
    gender,
    phoneNumber,
    additionalPhone,
    country,
    city,
    address,
    website,
    logo,
    docs,
    description,
  } = req.body;

  console.log("Received registration request:", {
    userType,
    username,
    email,
    gender,
    password,
    phoneNumber,
    additionalPhone,
    country,
    city,
    address,
    website,
    logo,
    docs,
    description,
  });

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the email already exists
    const isDevExist = await prisma.developer.findUnique({
      where: { email },
    });

    const isSuperAdminExist = await prisma.superAdmin.findUnique({
      where: { email },
    });

    const isCustomerExist = await prisma.customer.findUnique({
      where: { email },
    });

    const isAdminExist = await prisma.admin.findUnique({
      where: { email },
    });

    const isCompanyExist = await prisma.company.findUnique({
      where: { email },
    });

    if (
      isDevExist ||
      isSuperAdminExist ||
      isCustomerExist ||
      isAdminExist ||
      isCompanyExist
    ) {
      console.error("You already have an account:", email);
      return res.status(400).json({
        error: "You already have an account. Would you like to login?",
      });
    }

    let newUser;

    switch (userType) {
      case "customer":
        newUser = await prisma.customer.create({
          data: {
            userType,
            username,
            email,
            gender,
            password: hashedPassword,
          },
        });
        break;
      case "company":
        newUser = await prisma.company.create({
          data: {
            userType,
            username,
            email,
            password: hashedPassword,
            phoneNumber,
            additionalPhone,
            country,
            city,
            address,
            website,
            logo,
            docs,
            description,
          },
        });
        break;
      case "admin":
        newUser = await prisma.admin.create({
          data: {
            userType,
            username,
            email,
            password: hashedPassword,
          },
        });
        break;
      case "superAdmin":
        newUser = await prisma.superAdmin.create({
          data: {
            userType,
            username,
            email,
            password: hashedPassword,
          },
        });
        break;
      default:
        console.error("Invalid userType:", userType);
        return res.status(400).json({ error: "Invalid user type" });
    }

    console.log("Registration successful:", userType, newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

module.exports = app;
module.exports.handler = serverless(app);

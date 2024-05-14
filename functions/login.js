const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

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

app.post('/.netlify/functions/login', async (req, res) => {
  const { email, password } = req.body;

  console.log("Our Credentials", email, password);

  try {
    // Check against customer table
    const customer = await prisma.customer.findUnique({ where: { email } });

    if (customer && (await bcrypt.compare(password, customer.password))) {
      // Login successful for customer
      const token = jwt.sign(
        { userId: customer.id, userType: "customer" },
        "your-secret-key",
        { expiresIn: "1h" }
      );
      console.log("Login successful for customer:", customer);
      return res.status(200).json({
        message: "Login successful",
        ...customer,
        userId: customer.id,
        token,
      });
    }

    // Check against company table
    const company = await prisma.company.findUnique({ where: { email } });

    if (company) {
      // Login successful for company
      if (
        company.approved &&
        (await bcrypt.compare(password, company.password))
      ) {
        const token = jwt.sign(
          { userId: company.id, userType: "company" },
          "your-secret-key",
          { expiresIn: "1h" }
        );
        console.log("Login successful for company:", company);
        return res.status(200).json({
          message: "Login successful",
          ...company,
          userId: company.id,
          token,
        });
      } else {
        return res.status(401).json({
          error:
            "Your account is being reviewed by the admin. You will be notified if the admin approves your request",
        });
      }
    }

    // Check against admin table
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      // Login successful for admin
      const token = jwt.sign(
        { userId: admin.id, userType: "admin" },
        "your-secret-key",
        { expiresIn: "1h" }
      );

      console.log("Login successful for admin:", admin);
      return res.status(200).json({
        message: "Login successful",
        ...admin,
        userId: admin.id,
        token,
      });
    }

    const superAdmin = await prisma.superAdmin.findUnique({ where: { email } });

    if (superAdmin && (await bcrypt.compare(password, superAdmin.password))) {
      // Login successful for admin
      const token = jwt.sign(
        { userId: superAdmin.id, userType: "superAdmin" },
        "your-secret-key",
        { expiresIn: "1h" }
      );

      console.log("Login successful for superAdmin:", superAdmin);
      return res.status(200).json({
        message: "Login successful",
        ...superAdmin,
        userId: superAdmin.id,
        token,
      });
    }

    // User not found or incorrect password
    console.log("Login failed: Invalid credentials");
    res.status(401).json({ error: "Invalid credentials" });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = app;
module.exports.handler = serverless(app);

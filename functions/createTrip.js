// netlify-functions/createTrip.js
const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(bodyParser.json());

app.post('/.netlify/functions/createTrip', async (req, res) => {
  const {
    safraName,
    safraType,
    fromLocation,
    destination,
    safraDescription,
    dateFrom,
    dateTo,
    safraPrice,
    safraProgramme,
    offer,
    companyId,
  } = req.body;

  try {
    const safra = await prisma.trip.create({
      data: {
        name: safraName,
        type: safraType,
        fromLocation,
        destination,
        desc: safraDescription,
        dateFrom,
        dateTo,
        price: safraPrice,
        programme: {
          create: safraProgramme.map((item) => {
            return {
              program: item.program,
              dayNum: item.dayNum,
            };
          }),
        },
        offer: offer,
        companyId,
      },
      include: {
        programme: true,
      },
    });
    console.log("Safra created:", safra);
    res.status(201).json(safra);
  } catch (error) {
    console.error("Failed to create Safra:", error);
    res.status(500).json({ error: "Failed to create Safra" });
  }
});

module.exports = app;
module.exports.handler = serverless(app);

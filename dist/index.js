// inanna-backend/src/start-server.js
const {
  PrismaClient
} = require('@prisma/client');
const express = require('express');
const startServer = async () => {
  const prisma = new PrismaClient();

  // Add your routes and other backend logic here

  const app = express();
  const port = 3001;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

// Call the async function to start the server
startServer().catch(e => {
  throw e;
});
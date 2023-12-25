// inanna-backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Import the jsonwebtoken library

// const prisma = new PrismaClient();
// Replace the following information with your Google Cloud SQL instance details
const dbConfig = {
  user: 'root',
  password: 'root12345',
  database: 'innana-db',
  host: '34.132.215.148',
  port: 3306,
};

// Connect Prisma to the Google Cloud SQL instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `mysql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
    },
  },
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application-specific logging, throwing an error, or other logic here
});


// Registration route
app.post('/register', async (req, res) => {
  const { userType, username, email, password } = req.body;

  console.log('Received registration request:', { userType, username, email, password });

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    let newUser;

    if (userType === 'customer') {
      newUser = await prisma.customer.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });
    } else if (userType === 'company') {
      newUser = await prisma.company.create({
        data: {
          name: username, // Use 'name' for the company's name
          email,
          password: hashedPassword,
        },
      });
    } else if (userType === 'admin') {
      newUser = await prisma.admin.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });
    } else {
      console.error('Invalid userType:', userType);
      return res.status(400).json({ error: 'Invalid user type' });
    }

    console.log('Registration successful:', userType, newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});



// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check against customer table
    const customer = await prisma.customer.findUnique({ where: { email } });

    if (customer && (await bcrypt.compare(password, customer.password))) {
      // Login successful for customer
      const token = jwt.sign({ userId: customer.id, userType: 'customer' }, 'your-secret-key', { expiresIn: '1h' });
      console.log('Login successful for customer:', customer);
      return res.status(200).json({
        message: 'Login successful',
        userId: customer.id,
        token,
        username: customer.username,
        email: customer.email,
        userType: 'customer',
      });
    }

    // Check against company table
    const company = await prisma.company.findUnique({ where: { email } });

    if (company && (await bcrypt.compare(password, company.password))) {
      // Login successful for company
      const token = jwt.sign({ userId: company.id, userType: 'company' }, 'your-secret-key', { expiresIn: '1h' });
      console.log('Login successful for company:', company);
      return res.status(200).json({
        message: 'Login successful',
        userId: company.id,
        token,
        username: company.name,
        email: company.email,
        userType: 'company',
      });
    }

    // Check against admin table
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      // Login successful for admin
      const token = jwt.sign({ userId: admin.id, userType: 'admin' }, 'your-secret-key', { expiresIn: '1h' });
      console.log('Login successful for admin:', admin);
      return res.status(200).json({
        message: 'Login successful',
        userId: admin.id,
        token,
        username: admin.username,
        email: admin.email,
        userType: 'admin',
      });
    }

    // User not found or incorrect password
    console.log('Login failed: Invalid credentials');
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});


// Logout route (optional)
app.post('/logout', (req, res) => {
  // Perform any necessary cleanup on the server side
  // For example, revoke tokens or update session status

  console.log('Logout successful');
  res.status(200).json({ message: 'Logout successful' });
});


// Fetch users route
app.get('/users', async (req, res) => {
    try {
      const customers = await prisma.customer.findMany();
      const companies = await prisma.company.findMany();
      const admins = await prisma.admin.findMany();
  
      res.status(200).json({ customer: customers, company: companies, admin: admins });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Fetch companies route
app.get('/companies', async (req, res) => {
  try {
    const companies = await prisma.company.findMany();
    res.status(200).json(companies);
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Fetch products route
app.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        company: true, // Include company details in the response
      },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});




// Create product route
app.post('/products', async (req, res) => {
  const { name, companyId } = req.body;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        companyId: companyId, // Update to use companyId
      },
    });

    console.log('Product created:', product);
    res.status(201).json(product);
  } catch (error) {
    console.error('Failed to create product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});









const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

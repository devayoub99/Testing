// inanna-backend/server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Import the jsonwebtoken library

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Application-specific logging, throwing an error, or other logic here
});

// Registration route
app.post("/register", async (req, res) => {
  const {
    userType,
    username,
    email,
    password,
    location,
    website,
    logo,
    companyDocs,
    testingadsfasdf,
  } = req.body;

  console.log("Received registration request:", {
    userType,
    username,
    email,
    password,
    location,
    website,
    logo,
    companyDocs,
  });

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    let newUser;

    if (userType === "customer") {
      newUser = await prisma.customer.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });
    } else if (userType === "company") {
      newUser = await prisma.company.create({
        data: {
          name: username, // Use 'name' for the company's name
          email,
          password: hashedPassword,
          location,
          website,
          logo,
          docs: companyDocs,
        },
      });
    } else if (userType === "admin") {
      newUser = await prisma.admin.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });
    } else {
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

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Our Credentials", email, password)

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
        userId: customer.id,
        token,
        username: customer.username,
        email: customer.email,
        userType: "customer",
      });
    }

    // Check against company table
    const company = await prisma.company.findUnique({ where: { email } });

    if (company && (await bcrypt.compare(password, company.password))) {
      // Login successful for company
      const token = jwt.sign(
        { userId: company.id, userType: "company" },
        "your-secret-key",
        { expiresIn: "1h" }
      );
      console.log("Login successful for company:", company);
      return res.status(200).json({
        message: "Login successful",
        userId: company.id,
        token,
        username: company.name,
        email: company.email,
        userType: "company",
      });
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
        userId: admin.id,
        token,
        username: admin.username,
        email: admin.email,
        userType: "admin",
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

// Logout route (optional)
app.post("/logout", (req, res) => {
  // Perform any necessary cleanup on the server side
  // For example, revoke tokens or update session status

  console.log("Logout successful");
  res.status(200).json({ message: "Logout successful" });
});

// Fetch users route
app.get("/users", async (req, res) => {
  try {
    const customers = await prisma.customer.findMany();
    const companies = await prisma.company.findMany();
    const admins = await prisma.admin.findMany();

    res
      .status(200)
      .json({ customer: customers, company: companies, admin: admins });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Fetch companies route
app.get("/companies", async (req, res) => {
  try {
    const companies = await prisma.company.findMany();
    res.status(200).json(companies);
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

// Fetch products route
// app.get("/products", async (req, res) => {
//   try {
//     const products = await prisma.product.findMany({
//       include: {
//         company: true, // Include company details in the response
//       },
//     });

//     res.status(200).json(products);
//   } catch (error) {
//     console.error("Failed to fetch products:", error);
//     res.status(500).json({ error: "Failed to fetch products" });
//   }
// });

// Create product route
app.post("/products", async (req, res) => {
  const { name, companyId } = req.body;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        companyId: companyId, // Update to use companyId
      },
    });

    console.log("Product created:", product);
    res.status(201).json(product);
  } catch (error) {
    console.error("Failed to create product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Create Safra route
app.post("/createTrip", async (req, res) => {
  // console.log(`DATA: ${JSON.stringify(req.body)}`);
console.log("This is the req body: ", req.body);
  const {
    safraName,
    safraType,
    safraDescription,
    dateFrom,
    dateTo,
    timeStart,
    timeEnd,
    safraPrice,
    safraProgramme,
    offer,
  } = req.body;

  try {
    const safra = await prisma.safra.create({
      data: {
        name: safraName,
        type: safraType,
        desc: safraDescription,
        dateFrom,
        dateTo,
        timeStart,
        timeEnd,
        price: safraPrice,
        programme: safraProgramme,
        offer: offer,
      },
    });
    console.log("Safra created:", safra);
    res.status(201).json(safra); // Optionally send back the created Safra object
  } catch (error) {
    console.error("Failed to create Safra:", error);
    res.status(500).json({ error: "Failed to create Safra" });
  }
});

// Fetch Trips route
app.get("/trips", async (req, res) => {
  try {
    const trips = await prisma.safra.findMany();
    res.status(200).json(trips);
  } catch (error) {
    console.error("Failed to fetch trips:", error);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

//  Function to Get ONLY one Trip
app.get("/trip", async (req, res) => {
  try {
    const tripId = req.headers.id;
    const trip = await prisma.safra.findUnique({
      where: {
        id: parseInt(tripId),
      },
    });
    res.status(200).json(trip);
  } catch (error) {
    console.error("Failed to fetch Trip:", error);
    res.status(500).json({ error: "Failed to fetch Trip" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// safratake-backend/server.js
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Import the jsonwebtoken library
const nodemailer = require("nodemailer");

const prisma = new PrismaClient();
const app = express();

app.use(cors());

app.use(bodyParser.json());

const uploadImage = multer({ dest: "uploads/images/" });
const uploadPDF = multer({ dest: "uploads/pdf/" });

app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads/images"))
);

app.use("/pdf", express.static(path.join(__dirname, "uploads/pdf")));

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

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if the email is already exist

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

    if (userType === "customer") {
      newUser = await prisma.customer.create({
        data: {
          userType,
          username,
          email,
          gender,
          password: hashedPassword,
        },
      });
    } else if (userType === "company") {
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
    } else if (userType === "admin") {
      newUser = await prisma.admin.create({
        data: {
          userType,
          username,
          email,
          password: hashedPassword,
        },
      });
    } else if (userType === "superAdmin") {
      newUser = await prisma.superAdmin.create({
        data: {
          userType,
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
        userId: customer.id,
        token,
        username: customer.username,
        email: customer.email,
        userType: "customer",
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
          userId: company.id,
          token,
          username: company.username,
          email: company.email,
          userType: "company",
          logo: company.logo,
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
        userId: admin.id,
        token,
        username: admin.username,
        email: admin.email,
        userType: "admin",
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
        userId: superAdmin.id,
        token,
        username: superAdmin.username,
        email: superAdmin.email,
        userType: "superAdmin",
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

// Developer login route

app.post("/devLogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const developer = await prisma.developer.findUnique({ where: { email } });

    if (developer && (await bcrypt.compare(password, developer.password))) {
      // Login successful for admin
      const token = jwt.sign(
        { userId: developer.id, userType: "developer" },
        "your-secret-key",
        { expiresIn: "1h" }
      );

      console.log("Login successful for developer:", developer);

      return res.status(200).json({
        message: "Login successful",
        userId: developer.id,
        token,
        username: developer.username,
        email: developer.email,
        userType: "developer",
      });
    }
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Developer Register router

app.post("/devRegister", async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const developer = await prisma.developer.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    console.log("Registration successful:", developer);
    res.status(201).json(developer);
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Edit user route
app.patch("/editUser", async (req, res) => {
  const { userType, userId } = req.body;
  const newData = req.body;

  console.log("The request body", req.body);
  try {
    let emailExists;
    if (userType === "customer") {
      emailExists = await prisma.customer.findFirst({
        where: {
          AND: [
            { email: newData.email },
            {
              NOT: {
                id: userId, // Exclude the current user's ID from the search
              },
            },
          ],
        },
      });
    } else if (userType === "company") {
      emailExists = await prisma.company.findFirst({
        where: {
          AND: [
            { email: newData.email },
            {
              NOT: {
                id: userId,
              },
            },
          ],
        },
      });
    }

    if (emailExists) {
      return res
        .status(400)
        .json({ error: "Email is already in use by another account" });
    }

    let updatedData;
    if (userType === "customer") {
      updatedData = await prisma.customer.update({
        where: { id: userId },
        data: {
          username: newData.username,
          email: newData.email,
          phoneNumber: newData.phoneNumber,
          day: newData.day,
          month: newData.month,
          year: newData.year,
          country: newData.country,
          city: newData.city,
          address: newData.address,
        },
      });
    } else if (userType === "company") {
      updatedData = await prisma.company.update({
        where: { id: userId },
        data: {
          username: newData.username,
          email: newData.email,
          phoneNumber: newData.phoneNumber,
          additionalPhone: newData.additionalPhone,
          country: newData.country,
          city: newData.city,
          address: newData.address,
          website: newData.website,
          logo: newData.logo,
          docs: newData.docs,
        },
      });
    } else {
      return res.status(400).json({ error: "Invalid user type" });
    }
    // console.log("User updated:", updatedData);
    res.status(200).json(updatedData);
  } catch (error) {
    console.error("Failed to update user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Logout route
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

// * Fetch a customer route
app.get("/customer/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const customer = await prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the customer" });
  }
});

// * Delete a customer route
app.delete("/customer/:id", async (req, res) => {
  const { id } = req.params;
  const { adminId, adminPass, adminType } = req.body;

  try {
    let admin;
    if (adminType === "developer") {
      admin = await prisma.developer.findUnique({ where: { id: adminId } });
    } else if (adminType === "superAdmin") {
      admin = await prisma.superAdmin.findUnique({ where: { id: adminId } });
    } else if (adminType === "admin") {
      admin = await prisma.admin.findUnique({ where: { id: adminId } });
    }

    if (!admin) {
      throw new Error("Unauthorized operation");
    }

    const storedPassword = admin.password;

    const isPasswordMatch = await bcrypt.compare(adminPass, storedPassword);

    if (!isPasswordMatch) {
      throw new Error("You entered a wrong password");
    }

    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer) {
      throw new Error("The Customer doesn't exist");
    }

    await prisma.customer.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete the customer", error);
    res.status(500).json({ error: "Internal server error" });
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

// Fetch filtered companies route
app.get("/companies/:status", async (req, res) => {
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

// Fetch company by id route
app.get("/company", async (req, res) => {
  try {
    const companyId = req.headers.id;
    const ratings = await prisma.rating.findMany({
      where: {
        companyId,
      },
    });

    const company = await prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });
    res.status(200).json(company);
  } catch (error) {
    console.error("Failed to fetch Trip:", error);
    res.status(500).json({ error: "Failed to fetch Trip" });
  }
});

// Patch company route
app.patch("/company/:id", async (req, res) => {
  const companyId = req.params.id;
  const { action } = req.body;

  let updateData = {};
  if (action === "approve") {
    updateData = { approved: true };
  } else if (action === "freeze") {
    updateData = { frozen: req.body.frozen };
  } else if (action === "hide") {
    updateData = { hidden: req.body.hidden };
  } else {
    return res.status(400).json({ error: "Invalid action" });
  }

  console.log(`Updated DATA: ${updateData.frozen}`);

  try {
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });
    res.status(200).json(updatedCompany);
  } catch (error) {
    console.error("Failed to update company:", error);
    res.status(500).json({ error: "Failed to update company" });
  }
});

// Delete company route
app.delete(
  "/company/:companyId/:adminId/:adminPass/:adminType",
  async (req, res) => {
    const { adminId, adminPass, adminType, companyId } = req.params;

    try {
      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
        include: {
          safras: true,
        },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      let admin;
      if (adminType === "developer") {
        admin = await prisma.developer.findUnique({
          where: {
            id: adminId,
          },
        });
      } else if (adminType === "superAdmin") {
        admin = await prisma.superAdmin.findUnique({
          where: {
            id: adminId,
          },
        });
      } else if (adminType === "admin") {
        admin = await prisma.admin.findUnique({
          where: {
            id: adminId,
          },
        });
      }

      if (!admin) {
        throw new Error("Invalid admin");
      }

      const storedPassword = admin.password;

      const isPasswordMatch = await bcrypt.compare(adminPass, storedPassword);

      if (!isPasswordMatch) {
        throw new Error("Incorrect password");
      }

      // Delete associated trips only if password is correct
      await Promise.all(
        company.safras.map(async (trip) => {
          await prisma.trip.delete({
            where: {
              id: trip.id,
            },
          });
        })
      );

      await prisma.company.delete({
        where: {
          id: companyId,
        },
      });

      res.status(204).send(); // Send a successful response with no content
    } catch (error) {
      console.error("Failed to delete the User", error);
      res.status(500).send("Failed to delete the User");
    }
  }
);

// * Add feedback to a company route
app.post("/company/:id/feedback", async (req, res) => {
  const { customerId, rating, review } = req.body.data;
  const companyId = req.params.id;

  try {
    // Check if the rating already exists for the customer and company
    const existingRating = await prisma.rating.findFirst({
      where: {
        companyId,
        customerId,
      },
    });

    if (existingRating) {
      // If rating exists, update it
      await prisma.rating.update({
        where: {
          id: existingRating.id,
        },
        data: {
          rating,
          review,
        },
      });
    } else {
      // If rating does not exist, create it
      await prisma.rating.create({
        data: {
          rating,
          review,
          companyId,
          customerId,
        },
      });
    }

    // Calculate average rating for the company
    const ratings = await prisma.rating.findMany({
      where: {
        companyId,
      },
    });

    const totalRating = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = Math.round(totalRating / ratings.length);

    // Update the average rating for the company
    await prisma.company.update({
      where: {
        id: companyId,
      },
      data: {
        totalRatings: ratings.length,
        averageRating,
      },
    });

    res.status(200).json({
      message: "Rating received and average rating updated successfully",
    });
  } catch (error) {
    console.error("Failed to handle customer feedback:", error);
    res.status(500).json({ error: "Failed to handle customer feedback" });
  }
});

// Create trip route
app.post("/createTrip", async (req, res) => {
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
    tripImages,
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
        tripImages,
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

// Search route
app.post("/search/:searchType", async (req, res) => {
  const { searchType } = req.params;
  const searchQuery = req.body;

  try {
    if (searchType === "trips") {
      let whereClause = {};

      if (searchQuery.tripType && searchQuery.tripType !== "All") {
        whereClause.type = searchQuery.tripType;
      }
      if (searchQuery.fromLocation) {
        whereClause.fromLocation = { contains: searchQuery.fromLocation };
      }
      if (searchQuery.destination) {
        whereClause.destination = { contains: searchQuery.destination };
      }
      if (searchQuery.dateFrom) {
        whereClause.dateFrom = searchQuery.dateFrom + "T00:00:00.000Z";
      }
      if (searchQuery.dateTo) {
        whereClause.dateTo = searchQuery.dateTo + "T00:00:00.000Z";
      }

      const trips = await prisma.trip.findMany({
        where: whereClause,
      });

      res.status(200).json(trips);
    } else if (searchType === "companies") {
      let whereClause = {};

      if (searchQuery.travelAgency) {
        whereClause.username = { contains: searchQuery.travelAgency };
      }
      if (searchQuery.travelAgencyCity) {
        whereClause.city = searchQuery.travelAgencyCity;
      }
      if (searchQuery.travelAgencyAddress) {
        whereClause.address = searchQuery.travelAgencyAddress;
      }

      // Return only active companies
      whereClause.approved = true;
      whereClause.hidden = false;

      const companies = await prisma.company.findMany({
        where: whereClause,
      });

      res.status(200).json(companies);
    } else {
      res.status(400).json({ error: `Invalid search type: ${searchType}` });
    }
  } catch (error) {
    console.error("Failed to search: ", error);
    res.status(500).json({ error: "Failed to search" });
  }
});

// Fetch Trips route
app.get("/trips", async (req, res) => {
  try {
    const trips = await prisma.trip.findMany();
    res.status(200).json(trips);
  } catch (error) {
    console.error("Failed to fetch trips:", error);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

app.get("/customerTrips", async (req, res) => {
  try {
    const { ids } = req.query;
    const idList = ids.split(",");

    console.log(idList);

    const trips = await prisma.trip.findMany({
      where: {
        id: {
          in: idList,
        },
      },
    });

    res.status(200).json(trips);
  } catch (error) {
    console.error("Failed to fetch trips:", error);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

//  Function to Get ONLY one company trips route
app.get("/company/:id/trips", async (req, res) => {
  const { id } = req.params;
  try {
    const trips = await prisma.trip.findMany({
      where: {
        companyId: id,
      },
    });
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
    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
      include: {
        programme: true,
      },
    });
    console.log(trip);
    res.status(200).json(trip);
  } catch (error) {
    console.error("Failed to fetch Trip:", error);
    res.status(500).json({ error: "Failed to fetch Trip" });
  }
});

app.delete("/trip/:id", async (req, res) => {
  const { id } = req.params;

  const { userType, userId } = req.query;

  try {
    let user;

    switch (userType) {
      case "developer":
        user = await prisma.developer.findUnique({ where: { id: userId } });
        break;
      case "superAdmin":
        user = await prisma.superAdmin.findUnique({ where: { id: userId } });
        break;
      case "admin":
        user = await prisma.admin.findUnique({ where: { id: userId } });
        break;
      case "company":
        user = await prisma.company.findUnique({ where: { id: userId } });
        break;
      default:
        throw new Error("Invalid user type");
    }

    if (!user) {
      console.log("You are not allowed to do that operation");
    }

    await prisma.trip.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error("Sorry, Something went wrong");
    res.status(500).send("Internal server error.");
  }
});

// Function to save passenger route
app.post("/passenger", async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      passportNumber,
      email,
      phoneNumber,
      gender,
      day,
      month,
      year,
      nationality,
      address,
      tripId,
      companyId,
      customerId,
    } = req.body;

    // console.log(`Passenger data: ${req.body}`);

    const passenger = await prisma.passenger.create({
      data: {
        firstName,
        middleName,
        lastName,
        passportNumber,
        email,
        phoneNumber,
        gender,
        day,
        month,
        year,
        nationality,
        address,
        tripId,
        companyId,
        customerId,
      },
    });
    res.json(passenger);
  } catch (error) {
    res.status(500).json({ error: "Failed to create passenger" });
  }
});

// * Fetch passenger route
app.get("/passenger/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const passenger = await prisma.passenger.findMany({
      where: { customerId: id },
    });

    if (!passenger) {
      throw new Error("No Passenger exist");
    }

    // console.log("Found passenger:", passenger);
    res.status(200).json(passenger);
  } catch (error) {
    console.error(`Failed to fetch the passenger`, error);
    res.status(500).json({ error: "Failed to retrieve passengers" });
  }
});

// Fetch passengers route
app.get("/trip/:tripId/passengers", async (req, res) => {
  const { tripId } = req.params;
  const { userType, userId } = req.query;

  try {
    let user;
    if (userType === "admin") {
      user = await prisma.admin.findUnique({ where: { id: userId } });
    } else if (userType === "developer") {
      user = await prisma.developer.findUnique({ where: { id: userId } });
    } else if (userType === "company") {
      user = await prisma.company.findUnique({ where: { id: userId } });
    } else {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }

    if (!user) {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }

    if (userType === "admin" || userType === "developer") {
      const passengers = await prisma.passenger.findMany({
        where: { tripId },
      });
      res.json(passengers);
    } else if (userType === "company") {
      const passengers = await prisma.passenger.findMany({
        where: { tripId, companyId: userId },
      });
      res.json(passengers);
    } else {
      res.status(401).json({ msg: "Unauthorized" });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve passengers" });
  }
});

// Fetch users route
app.get("/user/:userId", async (req, res) => {
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

// Delete user route
app.delete("/user/:userId", async (req, res) => {
  const deletedUserId = req.params.userId;
  const userType = req.query.userType;
  const userPassword = req.query.userPassword;

  let storedPassword;

  try {
    if (userType === "customer") {
      const customer = await prisma.customer.findUnique({
        where: {
          id: deletedUserId,
        },
      });
      if (!customer) {
        throw new Error("Customer not found");
      }
      storedPassword = customer.password;
    } else if (userType === "company") {
      const company = await prisma.company.findUnique({
        where: {
          id: deletedUserId,
        },
        include: {
          safras: true, // Include associated trips
        },
      });
      if (!company) {
        throw new Error("Company not found");
      }
      storedPassword = company.password;

      const isPasswordMatch = await bcrypt.compare(
        userPassword,
        storedPassword
      );
      if (!isPasswordMatch) {
        throw new Error("Incorrect password");
      }

      // Delete associated trips only if password is correct
      await Promise.all(
        company.safras?.map(async (trip) => {
          await prisma.trip.delete({
            where: {
              id: trip.id,
            },
          });
        })
      );

      // Now delete the company
      await prisma.company.delete({
        where: {
          id: deletedUserId,
        },
      });
    } else if (userType === "admin") {
      const admin = await prisma.admin.findUnique({
        where: {
          id: deletedUserId,
        },
      });
      if (!admin) {
        throw new Error("Admin not found");
      }
      storedPassword = admin.password;
    } else {
      throw new Error("Invalid user type");
    }

    const isPasswordMatch = await bcrypt.compare(userPassword, storedPassword);
    if (!isPasswordMatch) {
      throw new Error("Incorrect password");
    }

    // If password matches and user type is valid, then delete the user
    if (userType === "customer") {
      await prisma.customer.delete({
        where: {
          id: deletedUserId,
        },
      });
    } else if (userType === "admin") {
      await prisma.admin.delete({
        where: {
          id: deletedUserId,
        },
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete the user", error);
    res.status(500).send("Failed to delete the user: " + error.message);
  }
});

// Change password route
app.post("/user/:userId/changepass", async (req, res) => {
  const userId = req.params.userId;
  const { passwords, userType } = req.body;

  try {
    let user;
    switch (userType) {
      case "customer":
        user = await prisma.customer.findUnique({ where: { id: userId } });
        break;
      case "company":
        user = await prisma.company.findUnique({ where: { id: userId } });
        console.log(`THE USER IS ${user}`);
        break;
      case "admin":
        user = await prisma.admin.findUnique({ where: { id: userId } });
        break;
      default:
        return res.status(400).json({ error: "Invalid user type" });
    }

    const isPasswordMatch = await bcrypt.compare(
      passwords.currentPassword,
      user.password
    );
    if (!isPasswordMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(passwords.newPassword, 10);

    switch (userType) {
      case "customer":
        await prisma.customer.update({
          where: { id: userId },
          data: { password: hashedNewPassword },
        });
        break;
      case "company":
        await prisma.company.update({
          where: { id: userId },
          data: { password: hashedNewPassword },
        });
        break;
      case "admin":
        await prisma.admin.update({
          where: { id: userId },
          data: { password: hashedNewPassword },
        });
        break;
    }

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// * Define a route for sending emails
app.post("/send-email", (req, res) => {
  const { to, name, subject, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,

    // * Try without this
    secure: false,

    auth: {
      user: "ayuob1999118a@gmail.com",
      pass: "djveowraliiekbys",
      //  user: process.env.MAILTRAP_USER,
      //  pass: process.env.MAILTRAP_PASSWORD
    },
  });

  const mailOptions = {
    from: "SafraTake",
    to: to,
    subject: subject,
    text: message,
    // * or HTML
    // html: `<p>Hello world</p>`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent: " + info.response);
      res.send("Email sent successfully");
    }
  });
});

// * Upload image Route
// "image" should match the name attribute of the file input in your form
app.post("/uploadImage", uploadImage.single("image"), (req, res) => {
  const { imageType } = req.body;

  const file = req.file;

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }
  // Save file details to database using Prisma
  const { originalname, path, size, mimetype } = file;
  prisma.image
    .create({
      data: {
        filename: originalname,
        path: path,
        size: size,
        mime_type: mimetype,
        image_type: imageType,
      },
    })
    .then((image) => {
      console.log("Image metadata saved:", image);
      res.status(200).json({
        message: "Image uploaded successfully.",
        imagePath: path.split("\\").pop(),
      });
    })
    .catch((error) => {
      console.error("Error saving image metadata:", error);
      res.status(500).send("Internal server error.");
    });
});

// * fetch image Route
app.get("/image/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, "uploads/images", filename);

  // Check if the file exists
  if (fs.existsSync(imagePath)) {
    // Send the file to the client
    res.sendFile(imagePath);
  } else {
    // If the file doesn't exist, send a 404 error
    res.status(404).send("File not found.");
  }
});

// * Upload images route
app.post("/uploadImages", uploadImage.array("images", 10), (req, res) => {
  const { imageType } = req.body;

  const files = req.files;
  console.log(files);

  if (!files || files.length === 0) {
    return res.status(400).send("No files uploaded.");
  }

  const savePromises = files.map((file) => {
    const { originalname, path, size, mimetype } = file;
    return prisma.image.create({
      data: {
        filename: originalname,
        path: path,
        size: size,
        mime_type: mimetype,
        image_type: imageType,
      },
    });
  });

  Promise.all(savePromises)
    .then((images) => {
      console.log("Image metadata saved:", images);
      const imagePaths = images.map((image) => {
        const filename = image.path
          .replace(/^.*[\\\/]/, "")
          .replace(/\.[^/.]+$/, "");
        return filename;
      });

      res.status(200).json({
        message: "Images uploaded successfully.",
        imagePaths: imagePaths,
      });
    })
    .catch((error) => {
      console.error("Error saving image metadata:", error);
      res.status(500).send("Internal server error.");
    });
});

// * Upload PDF route
app.post("/uploadPDF", uploadPDF.array("pdf", 5), (req, res) => {
  const { pdfType } = req.body;

  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).send("No files uploaded.");
  }

  // Save file details to database using Prisma
  const pdfPromises = files.map((file) => {
    const { originalname, path, size, mimetype } = file;
    return prisma.image.create({
      data: {
        filename: originalname,
        path: path,
        size: size,
        mime_type: mimetype,
        image_type: pdfType,
      },
    });
  });

  Promise.all(pdfPromises)
    .then((pdfs) => {
      console.log("PDFs metadata saved:", pdfs);
      const pdfPaths = pdfs.map((pdf) => pdf.path.split("\\").pop());
      res.status(200).json({
        message: "PDFs uploaded successfully.",
        pdfPaths: pdfPaths,
      });
    })
    .catch((error) => {
      console.error("Error saving PDFs metadata:", error);
      res.status(500).send("Internal server error.");
    });
});

// * function related to GET PDF
function getFilePath(fileId) {
  return `uploads/pdf/${fileId}`; // Adjust the file extension accordingly
}

// * fetch PDF Route
app.get("/pdfs/:id", (req, res) => {
  const fileId = req.params.id;
  const filePath = getFilePath(fileId);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(err);
      res.status(404).json({ error: "File not found" });
      return;
    }

    // Stream the file to the client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// safratake-backend/server.js
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
    country,
    city,
    address,
    website,
    logo,
    companyDocs,
  } = req.body;

  console.log("Received registration request:", {
    userType,
    username,
    email,
    password,
    country,
    city,
    address,
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
          userType,
          username,
          email,
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
          country,
          city,
          address,
          website,
          logo,
          docs: companyDocs,
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

    // User not found or incorrect password
    console.log("Login failed: Invalid credentials");
    res.status(401).json({ error: "Invalid credentials" });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Login failed" });
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
app.delete("/company/:id", async (req, res) => {
  const companyId = req.params.id;

  console.log(`COMPANYID: ${companyId}`);

  try {
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
});

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

// Fetch products route
// app.get("/products", async (req, res) => {
//   try {
//     const products = await prisma.product.findMany({
//       include: {
//         company: true, // Include company details in the response
//       },
//     });

// Create Safra route
app.post("/createTrip", async (req, res) => {
  // console.log(`DATA: ${JSON.stringify(req.body)}`);
  console.log("This is the req body: ", req.body);
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

  // console.log(`safraProgramme => ${safraProgramme}`);

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
            console.log(item);
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
        programme: true, // Include related entries in the response
      },
    });
    console.log("Safra created:", safra);
    res.status(201).json(safra); // Optionally send back the created Safra object
  } catch (error) {
    console.error("Failed to create Safra:", error);
    res.status(500).json({ error: "Failed to create Safra" });
  }
});

// Search a trip route
app.post("/searchTrips", async (req, res) => {
  const searchQuery = req.body;
  console.log("Search Query: ", searchQuery);

  try {
    let whereClause = {};

    if (searchQuery.tripType) {
      whereClause.type = { equals: searchQuery.tripType };
    }
    if (searchQuery.fromLocation) {
      whereClause.fromLocation = { equals: searchQuery.fromLocation };
    }
    if (searchQuery.destination) {
      whereClause.destination = { equals: searchQuery.destination };
    }
    if (searchQuery.dateFrom) {
      whereClause.dateFrom = { equals: searchQuery.dateFrom };
    }
    if (searchQuery.dateTo) {
      whereClause.dateTo = { equals: searchQuery.dateTo };
    }

    const trips = await prisma.trip.findMany({
      where: whereClause,
    });

    res.status(200).json(trips);
  } catch (error) {
    console.error("Failed to search trips:", error);
    res.status(500).json({ error: "Failed to search trips" });
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

//  Function to Get ONLY one Trip route
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
        programme: true, // Include related SafraProgramme entries
      },
    });
    console.log(trip);
    res.status(200).json(trip);
  } catch (error) {
    console.error("Failed to fetch Trip:", error);
    res.status(500).json({ error: "Failed to fetch Trip" });
  }
});

app.delete("/trip/:id", (req, res) => {});

app.post("/passenger", async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      gender,
      day,
      month,
      year,
      nationality,
      tripId,
    } = req.body;

    console.log(`Passenger data: ${req.body}`);

    const passenger = await prisma.passenger.create({
      data: {
        firstName,
        middleName,
        lastName,
        email,
        phoneNumber,
        gender,
        day,
        month,
        year,
        nationality,
        tripId,
      },
    });
    res.json(passenger);
  } catch (error) {
    res.status(500).json({ error: "Failed to create passenger" });
  }
});

// Fetch passengers route
app.get("/passengers", async (req, res) => {
  try {
    const passengers = await prisma.passenger.findMany();
    res.json(passengers);
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
    console.log(user);

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

  console.log(`DELETEDUSERID ${deletedUserId}`);
  console.log(`userType ${userType}`);
  console.log(`userPassword ${userPassword}`);

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
      });

      console.log(`DELETED COMPANY is ${company}`);
      if (!company) {
        throw new Error("Company not found");
      }
      storedPassword = company.password;
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
    } else if (userType === "company") {
      await prisma.company.delete({
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

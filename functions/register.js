// inanna-backend/functions/register.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

exports.handler = async (event) => {
  const { userType, username, email, password, country, city, address, website, logo, companyDocs } = JSON.parse(event.body);

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
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid user type" }) };
    }

    console.log("Registration successful:", userType, newUser);
    return { statusCode: 201, body: JSON.stringify(newUser) };
  } catch (error) {
    console.error("Registration failed:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Registration failed" }) };
  }
};

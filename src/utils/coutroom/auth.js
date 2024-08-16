const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 10;
const jwtSecret = "your_jwt_secret"; // Replace with your own secret

// Function to hash the password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

// Function to compare passwords
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Function to generate JWT token
const generateToken = (payload) => {
  let now;
  const utcDate = new Date(); // Get the current UTC time
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30 in milliseconds
  now = new Date(utcDate.getTime() + istOffset);

  if (process.env.NODE_ENV === "production") {
    const utcDate = new Date(); // Get the current UTC time
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30 in milliseconds
    now = new Date(utcDate.getTime() + istOffset);
  } else {
    // Get the current date and hour in local time (for development)
    now = new Date();
  }

  // Calculate the remaining time in seconds until the next hour
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const remainingSeconds = (60 - minutes) * 60 - seconds;

  // Calculate the expiration time
  const expiresAt = now.getTime() + remainingSeconds * 1000;

  console.log("token expiration => ", expiresAt);

  // Generate the token with the calculated expiration time
  const token = jwt.sign(payload, jwtSecret, { expiresIn: remainingSeconds });

  return { token, expiresAt };
};

// Function to verify JWT token
const verifyTokenCR = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (err) {
    return null;
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyTokenCR,
};

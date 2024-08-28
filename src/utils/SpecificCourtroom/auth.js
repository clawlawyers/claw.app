const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { EXPIRES_IN } = require("../../config/server-config");
const moment = require("moment");

const saltRounds = 10;
const jwtSecret = "your_jwt_secret"; // Replace with your own secret

// Function to hash the password
const hashPasswordSpecial = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

// Function to compare passwords
const comparePasswordSpecial = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Function to generate JWT token
const generateTokenSpecial = (payload) => {
  const expiresIn = moment.duration({ days: parseInt(EXPIRES_IN) });
  const expiresAt = moment().add(expiresIn).valueOf();
  const token = jwt.sign(payload, jwtSecret, {
    expiresIn: expiresIn.asSeconds(),
  });

  return { token, expiresAt };
};

// Function to verify JWT token
const verifyTokenCRSpecial = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (err) {
    return null;
  }
};

module.exports = {
  hashPasswordSpecial,
  comparePasswordSpecial,
  generateTokenSpecial,
  verifyTokenCRSpecial,
};

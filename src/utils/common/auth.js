const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, EXPIRES_IN } = require("../../config/server-config");
const moment = require("moment");

function checkPassword(originalPassword, encryptedPassword) {
  try {
    return bcrypt.compareSync(originalPassword, encryptedPassword);
  } catch (error) {
    throw error;
  }
}

function createToken(payload) {
  try {
    const expiresIn = moment.duration({ days: parseInt(EXPIRES_IN) });
    const expiresAt = moment().add(expiresIn).valueOf();
    const token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: expiresIn.asSeconds(),
    });
    return { jwt: token, expiresAt };
  } catch (error) {
    throw error;
  }
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  checkPassword,
  createToken,
  verifyToken,
};

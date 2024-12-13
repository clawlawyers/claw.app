const mongoose = require("mongoose");

const EnterperiseuserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    startToken: {
      type: Number,
      required: true,
      default: 0,
    },
    endToken: {
      type: Number,
      required: true,
      default: 0,
    },
    usedToken: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const EnterprisesUser = mongoose.model(
  "EnterprisesUser",
  EnterperiseuserSchema
);

module.exports = EnterprisesUser;

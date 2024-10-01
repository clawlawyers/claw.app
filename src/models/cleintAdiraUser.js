const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the individual courtroom booking subdocument schema
const ClientAdiraUserSchema = new Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  Domain: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalHours: { type: Number, required: true },
  totalUsedHours: { type: Number, required: true, default: 0 },
});

const ClientAdiraUser = mongoose.model(
  "ClientAdiraUser",
  ClientAdiraUserSchema
);

module.exports = ClientAdiraUser;

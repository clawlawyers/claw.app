const mongoose = require("mongoose");

const legalAutomationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  serviceInterested: {
    type: String,
    required: true,
  },
  firmOrIndividual: {
    type: String,
    required: true,
  },
  additionalInfo: {
    type: String,
    required: true,
  },
});

const LegalAutomation = mongoose.model(
  "LegalAutomation",
  legalAutomationSchema
);

module.exports = LegalAutomation;

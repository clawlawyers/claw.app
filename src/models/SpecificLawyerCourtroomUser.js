const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the individual courtroom booking subdocument schema
const SpecificLawyerCourtroomUserSchema = new Schema({
  userId: { type: String },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  recording: { type: Boolean, required: true },
  caseOverview: {
    type: String,
    required: true,
    default: "",
  },
  totalHours: { type: Number, required: true },
  totalUsedHours: { type: Number, required: true, default: 0 },
});

const SpecificLawyerCourtroomUser = mongoose.model(
  "SpecificLawyerCourtroomUser",
  SpecificLawyerCourtroomUserSchema
);

module.exports = SpecificLawyerCourtroomUser;

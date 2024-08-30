// server/models/EnrolledUser.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EnrolledUserSchema = new Schema({
  phoneNumber: String,
  location: String,
  dateEnrolled: Date,
  dateLastSubscribed: Date,
  status: { type: String, enum: ["Retained", "Dropped"] },
  dropDate: Date,
  totalTokensUsed: Number,
  pagesMostVisited: [String],
  salesman: { type: Schema.Types.ObjectId, ref: "Salesman" },
});

module.exports = mongoose.model("EnrolledUser", EnrolledUserSchema);

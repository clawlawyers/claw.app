const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the individual courtroom booking subdocument schema
const TrailCourtroomUserSchema = new Schema({
  userId: { type: String },
  coupon: { type: String },
  password: { type: String },
  recording: { type: Boolean, required: true },
  caseOverview: {
    type: String,
    default: "",
  },
});

const TrailCourtroomUser2 = mongoose.model(
  "TrailCourtroomUser2",
  TrailCourtroomUserSchema
);

module.exports = TrailCourtroomUser2;

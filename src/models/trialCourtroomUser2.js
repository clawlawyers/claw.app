const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the individual courtroom booking subdocument schema
const TrailCourtroomUserSchema = new Schema({
  userId: { type: String },
  CouponCode: { type: String, required: true },
  password: { type: String },
  recording: { type: Boolean, required: true },
  caseOverview: {
    type: String,
    default: "",
  },
  date: { type: Date, required: true },
  hour: { type: Number, required: true, min: 0, max: 23 },
});

const TrailCourtroomUser2 = mongoose.model(
  "TrailCourtroomUser2",
  TrailCourtroomUserSchema
);

module.exports = TrailCourtroomUser2;

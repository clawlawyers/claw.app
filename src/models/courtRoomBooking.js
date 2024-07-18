const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

// Define the individual courtroom booking subdocument schema
const CourtroomBookingSchema = new Schema({
  // userId: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

// Define the booking schema
const BookingSchema = new Schema({
  date: { type: Date, required: true },
  hour: { type: Number, required: true, min: 0, max: 23 },
  courtroomBookings: [CourtroomBookingSchema],
});

const CourtRoomBooking = mongoose.model("CourtRoomBooking", BookingSchema);

module.exports = CourtRoomBooking;

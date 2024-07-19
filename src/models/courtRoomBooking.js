const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the individual courtroom booking subdocument schema
const CourtroomBookingSchema = new Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  recording: { type: Boolean, required: true },
});

// Define the booking schema
const BookingSchema = new Schema({
  date: { type: Date, required: true },
  hour: { type: Number, required: true, min: 0, max: 23 },
  courtroomBookings: [CourtroomBookingSchema],
});

const CourtRoomBooking = mongoose.model("CourtRoomBooking", BookingSchema);

module.exports = CourtRoomBooking;

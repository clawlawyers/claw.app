const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the booking schema
const TrailBookingSchema = new Schema({
  date: { type: Date, required: true },
  hour: { type: Number, required: true, min: 0, max: 23 },
  courtroomBookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrailCourtroomUser",
      required: true,
    },
  ],
});

const TrailCourtRoomBooking = mongoose.model(
  "TrailCourtRoomBooking",
  TrailBookingSchema
);

module.exports = TrailCourtRoomBooking;

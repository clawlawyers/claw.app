const mongoose = require("mongoose");

const timeBasedBookingSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },

  endDate: {
    type: Date,
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
});

// Index to ensure that a user doesn't book overlapping times for the same model

const TimeBasedBooking = mongoose.model(
  "TimeBasedBooking",
  timeBasedBookingSchema
);

module.exports = TimeBasedBooking;

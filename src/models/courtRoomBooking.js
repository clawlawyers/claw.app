const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the booking schema
const BookingSchema = new Schema({
  date: { type: Date, required: true },
  hour: { type: Number, required: true, min: 0, max: 23 },
  courtroomBookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourtroomUser",
      required: true,
    },
  ],
});

const CourtRoomBooking = mongoose.model("CourtRoomBooking", BookingSchema);

module.exports = CourtRoomBooking;

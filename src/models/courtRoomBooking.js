const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the individual courtroom booking subdocument schema
const CourtroomBookingSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  password: { type: String, required: true },
});

// Define the booking schema
const BookingSchema = new Schema({
  date: { type: Date, required: true },
  hour: { type: Number, required: true, min: 0, max: 23 },
  courtroomBookings: [CourtroomBookingSchema],
});

// // Pre-save hook to enforce booking rules
// BookingSchema.pre("save", async function (next) {
//   try {
//     // Check for existing bookings at the same date and hour
//     const existingBookings = await mongoose
//       .model("CourtRoomBooking")
//       .find({ date: this.date, hour: this.hour });

//     // Count the number of existing bookings
//     const totalBookings = existingBookings.reduce(
//       (count, booking) => count + booking.courtroomBookings.length,
//       0
//     );

//     if (totalBookings + this.courtroomBookings.length > 4) {
//       const err = new Error(
//         `Maximum of 4 courtrooms can be booked at ${
//           this.hour
//         }:00 on ${this.date.toDateString()}.`
//       );
//       return next(err);
//     }

//     // Check if the same user has already booked a courtroom at the same hour
//     const userSet = new Set();
//     existingBookings.forEach((booking) => {
//       booking.courtroomBookings.forEach((courtroomBooking) => {
//         userSet.add(courtroomBooking.userId.toString());
//       });
//     });

//     console.log(this);

//     for (const courtroomBooking of this.courtroomBookings) {
//       //   console.log(courtroomBooking.userId.toString());
//       if (userSet.has(courtroomBooking.userId.toString())) {
//         const err = new Error(
//           `User ${courtroomBooking.userId} has already booked a courtroom at ${
//             this.hour
//           }:00 on ${this.date.toDateString()}.`
//         );
//         return next(err);
//       }
//       userSet.add(courtroomBooking.userId.toString());
//     }

//     next();
//   } catch (err) {
//     next(err);
//   }
// });

const CourtRoomBooking = mongoose.model("CourtRoomBooking", BookingSchema);

module.exports = CourtRoomBooking;

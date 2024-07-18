const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");
const CourtRoomBooking = require("../models/courtRoomBooking");

async function courtRoomBook(
  name,
  phoneNumber,
  email,
  hashedPassword,
  bookingDate,
  hour
) {
  try {
    // Find existing booking for the same date and hour
    let booking = await CourtRoomBooking.findOne({
      date: bookingDate,
      hour: hour,
    });

    if (!booking) {
      // Create a new booking if it doesn't exist
      booking = new CourtRoomBooking({
        date: bookingDate,
        hour: hour,
        courtroomBookings: [],
      });
    }

    // Check if the total bookings exceed the limit
    if (booking.courtroomBookings.length >= 4) {
      console.log(
        `Maximum of 4 courtrooms can be booked at ${hour}:00 on ${bookingDate.toDateString()}.`
      );
      return `Maximum of 4 courtrooms can be booked at ${hour}:00 on ${bookingDate.toDateString()}.`;
    }

    // Check if the user with the same mobile number or email already booked a slot at the same hour
    const existingBooking = booking.courtroomBookings.find(
      (courtroomBooking) =>
        courtroomBooking.phoneNumber === toString(phoneNumber) ||
        courtroomBooking.email === toString(email)
    );

    console.log(existingBooking);

    if (existingBooking) {
      console.log(
        `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom at ${hour}:00 on ${bookingDate.toDateString()}.`
      );
      return `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom at ${hour}:00 on ${bookingDate.toDateString()}.`;
    }

    // Add the new booking
    booking.courtroomBookings.push({
      name,
      phoneNumber,
      email,
      password: hashedPassword,
    });

    // Save the booking
    await booking.save();
    console.log("Booking saved.");
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error.");
  }
}

async function getBookedData(lastMonth) {
  try {
    const bookings = await CourtRoomBooking.aggregate([
      {
        $match: {
          date: { $gte: lastMonth },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            hour: "$hour",
          },
          bookingCount: { $sum: { $size: "$courtroomBookings" } },
        },
      },
      {
        $sort: { "_id.date": 1, "_id.hour": 1 },
      },
    ]);
    return bookings;
  } catch (error) {
    console.log(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

module.exports = {
  courtRoomBook,
  getBookedData,
};

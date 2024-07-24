const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");
const CourtRoomBooking = require("../models/courtRoomBooking");
const CourtroomUser = require("../models/CourtroomUser");
const { comparePassword, generateToken } = require("../utils/coutroom/auth");
const CourtroomHistory = require("../models/courtRoomHistory");
const { COURTROOM_API_ENDPOINT } = process.env;

async function courtRoomBook(
  name,
  phoneNumber,
  email,
  hashedPassword,
  bookingDate,
  hour,
  recording
) {
  try {
    // Find existing booking for the same date and hour
    let booking = await CourtRoomBooking.findOne({
      date: bookingDate,
      hour: hour,
    }).populate("courtroomBookings");

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
        courtroomBooking.phoneNumber == phoneNumber ||
        courtroomBooking.email == email
    );

    console.log(existingBooking);

    if (existingBooking) {
      console.log(
        `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom at ${hour}:00 on ${bookingDate.toDateString()}.`
      );
      return `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom at ${hour}:00 on ${bookingDate.toDateString()}.`;
    }

    // Create a new courtroom user
    const newCourtroomUser = new CourtroomUser({
      name,
      phoneNumber,
      email,
      password: hashedPassword,
      recording: recording, // Assuming recording is required and set to true
    });

    // Save the new courtroom user
    const savedCourtroomUser = await newCourtroomUser.save();

    // Add the new booking
    booking.courtroomBookings.push(savedCourtroomUser._id);

    // Save the booking
    await booking.save();
    console.log("Booking saved.");
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error.");
  }
}

async function getBookedData(startDate, endDate) {
  try {
    const bookings = await CourtRoomBooking.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
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
    console.error(error);
    throw new Error("Internal server error.");
  }
}

async function loginToCourtRoom(phoneNumber, password) {
  try {
    // Get the current date and hour
    const currentDate = new Date();
    const formattedDate = new Date(
      Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      )
    );
    const currentHour = currentDate.getHours();

    console.log(formattedDate, currentHour);

    // const currentDate = "2024-07-30";
    // const currentHour = 14;

    // Find existing booking for the current date and hour
    const booking = await CourtRoomBooking.findOne({
      date: formattedDate,
      hour: currentHour,
    }).populate("courtroomBookings");

    if (!booking) {
      return "No bookings found for the current time slot.";
    }

    console.log(booking);

    // Check if the user with the given phone number is in the booking
    const userBooking = booking.courtroomBookings.find((courtroomBooking) => {
      console.log(courtroomBooking.phoneNumber == phoneNumber);
      return courtroomBooking.phoneNumber == phoneNumber;
    });

    console.log(userBooking);

    if (!userBooking) {
      return "Invalid phone number or password.";
    }

    // Check if the password is correct
    const isPasswordValid = await comparePassword(
      password,
      userBooking.password
    );

    if (!isPasswordValid) {
      return "Invalid phone number or password.";
    }

    // Generate a JWT token
    const token = generateToken({
      userId: userBooking._id,
      phoneNumber: userBooking.phoneNumber,
    });

    let userId;

    if (!userBooking.userId) {
      const userId1 = await registerNewCourtRoomUser();
      userBooking.userId = userId1.user_id;
      userId = userId1.user_id;
      await userBooking.save();
    } else {
      userId = userBooking.userId;
    }

    // Respond with the token
    return {
      ...token,
      userId: userId,
      phoneNumber: userBooking.phoneNumber,
    };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function registerNewCourtRoomUser(body) {
  console.log(body);
  const response = await fetch(`${COURTROOM_API_ENDPOINT}/user_id`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  console.log(response);

  return response.json();
}

async function getClientByPhoneNumber(phoneNumber) {
  try {
    // Get the current date and hour
    const currentDate = new Date();
    const currentHour = currentDate.getHours();

    // const currentDate = "2024-07-30";
    // const currentHour = 14;

    // Find existing booking for the current date and hour
    const booking = await CourtRoomBooking.findOne({
      date: currentDate,
      hour: currentHour,
    });

    if (!booking) {
      return "No bookings found for the current time slot.";
    }

    // Check if the user with the given phone number is in the booking
    const userBooking = booking.courtroomBookings.find((courtroomBooking) => {
      return courtroomBooking.phoneNumber == phoneNumber;
    });

    console.log(userBooking);

    return userBooking;
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getClientByUserid(userid) {
  try {
    // Get the current date and hour
    const currentDate = new Date();
    const formattedDate = new Date(
      Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      )
    );
    const currentHour = currentDate.getHours();

    console.log(formattedDate, currentHour);

    // Manual Override for Testing
    // const formattedDate = new Date("2024-07-23T00:00:00.000Z");
    // const currentHour = 20;

    // Find existing booking for the current date and hour
    const booking = await CourtRoomBooking.findOne({
      date: formattedDate,
      hour: currentHour,
    }).populate("courtroomBookings");

    console.log(booking);

    if (!booking) {
      throw Error("No bookings found for the current time slot.");
      // return "No bookings found for the current time slot.";
    }

    // Check if the user with the given phone number is in the booking
    const userBooking = booking.courtroomBookings.find((courtroomBooking) => {
      return courtroomBooking.userId == userid;
    });

    console.log(userBooking);

    return { User_id: userBooking._id, Booking_id: booking };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function storeCaseHistory(userId, slotId, caseHistoryDetails) {
  try {
    // Find the courtroom history by userId and slotId
    let courtroomHistory = await CourtroomHistory.findOne({
      userId: userId,
      slot: slotId,
    });

    if (!courtroomHistory) {
      // Create a new courtroom history if it doesn't exist
      courtroomHistory = new CourtroomHistory({
        userId: userId,
        slot: slotId,
        history: [],
        latestCaseHistory: {},
      });
    }

    // Append the new case history details to the history array
    courtroomHistory.history.push(caseHistoryDetails);
    // Set the latest case history
    courtroomHistory.latestCaseHistory = caseHistoryDetails;

    // Save the updated courtroom history
    await courtroomHistory.save();
    console.log("Case history saved.");
    return courtroomHistory;
  } catch (error) {
    console.error("Error saving case history:", error);
    throw new Error("Internal server error.");
  }
}

module.exports = {
  courtRoomBook,
  getBookedData,
  loginToCourtRoom,
  getClientByPhoneNumber,
  getClientByUserid,
  storeCaseHistory,
};

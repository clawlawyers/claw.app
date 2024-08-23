const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");

const ContactUs = require("../models/contact");
const {
  sendAdminContactUsNotification,
} = require("../utils/coutroom/sendEmail");

const SpecificLawyerCourtroomUser = require("../models/SpecificLawyerCourtroomUser");
const SpecificLawyerCourtroomHistory = require("../models/SpecificLawyerCourtroomHistory");
const {
  comparePasswordSpecial,
  generateTokenSpecial,
} = require("../utils/SpecificCourtroom/auth");
const { COURTROOM_API_ENDPOINT } = process.env;

async function addContactUsQuery(
  firstName,
  lastName,
  email,
  phoneNumber,
  preferredContactMode,
  businessName,
  query
) {
  try {
    // Create a new contact us query
    const newContactUsQuery = new ContactUs({
      firstName,
      lastName,
      email,
      phoneNumber,
      preferredContactMode,
      businessName,
      query,
      queryPushedToEmail: true, // Flag to indicate if the query was pushed to the email
    });

    // Save the new contact us query
    await newContactUsQuery.save();

    await sendAdminContactUsNotification({
      firstName,
      lastName,
      email,
      phoneNumber,
      preferredContactMode,
      businessName,
      query,
    });

    console.log(newContactUsQuery);

    return newContactUsQuery;
  } catch (error) {
    console.log(error.message);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function courtRoomBook(
  name,
  phoneNumber,
  email,
  hashedPassword,
  totalHours,
  recording,
  caseOverview
) {
  console.log("Here is caseOverview", caseOverview);
  try {
    const allUserBooking = await SpecificLawyerCourtroomUser.find({});

    // Check if the user with the same mobile number or email already booked a slot at the same hour
    const existingBooking = allUserBooking.find(
      (courtroomBooking) =>
        courtroomBooking.phoneNumber == phoneNumber ||
        courtroomBooking.email == email
    );

    console.log(existingBooking);

    if (existingBooking) {
      console.log(
        `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom.`
      );
      return `User with phone number ${phoneNumber} or email ${email} has already booked a courtroom.`;
    }

    // Create a new courtroom user
    const newCourtroomUser = new SpecificLawyerCourtroomUser({
      name,
      phoneNumber,
      email,
      password: hashedPassword,
      recording: recording, // Assuming recording is required and set to true
      caseOverview: "NA",
      totalHours: totalHours,
    });

    console.log(newCourtroomUser);

    // Save the new courtroom user
    const savedCourtroomUser = await newCourtroomUser.save();

    console.log(savedCourtroomUser);

    console.log("Booking saved successfully");
  } catch (error) {
    console.error(error);
    throw new Error("Internal server error.", error.message);
  }
}

async function loginToCourtRoom(phoneNumber, password) {
  try {
    // Find existing booking
    const userBooking = await SpecificLawyerCourtroomUser.findOne({
      phoneNumber: phoneNumber,
    });
    if (!userBooking) {
      return "Invalid phone number or password.";
    }

    console.log(userBooking);

    // Check if the password is correct
    const isPasswordValid = await comparePasswordSpecial(
      password,
      userBooking.password
    );

    if (!isPasswordValid) {
      return "Invalid phone number or password.";
    }

    // Generate a JWT token
    const token = generateTokenSpecial({
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
      //   slotTime: booking.hour,
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
    // Find existing booking for the current date and hour
    const userBooking = await SpecificLawyerCourtroomUser.findOne({
      phoneNumber: phoneNumber,
    });
    if (!userBooking) {
      return "No bookings found for the current time slot.";
    }

    // console.log(userBooking);

    return { userBooking };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getClientByUserid(userid) {
  try {
    // Find existing booking for the current date and hour
    const userBooking = await SpecificLawyerCourtroomUser.findOne({
      userId: userid,
    });

    console.log(userBooking);

    return { User_id: userBooking._id };
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function storeCaseHistory(userId, slotId, caseHistoryDetails) {
  try {
    // Find the courtroom history by userId and slotId
    let courtroomHistory = await SpecificLawyerCourtroomHistory.findOne({
      userId: userId,
      slot: slotId,
    });

    if (!courtroomHistory) {
      // Create a new courtroom history if it doesn't exist
      courtroomHistory = new SpecificLawyerCourtroomHistory({
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

async function getSessionCaseHistory(userId) {
  try {
    console.log(userId);
    const caseHistory = await SpecificLawyerCourtroomHistory.findOne({
      userId: userId,
    });
    // console.log("Case history retrieved:", caseHistory);
    return caseHistory;
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

// Service to get a client by phone number with a session
async function getClientByPhoneNumberWithSession(phoneNumber, session) {
  try {
    const user = await SpecificLawyerCourtroomUser.findOne({
      phoneNumber,
    }).session(session);
    return user;
  } catch (error) {
    console.error(`Error fetching user by phone number ${phoneNumber}:`, error);
    throw error;
  }
}

// Service to update a client by phone number with a session
async function updateClientByPhoneNumberWithSession(
  phoneNumber,
  updateData,
  session
) {
  try {
    const user = await SpecificLawyerCourtroomUser.findOneAndUpdate(
      { phoneNumber },
      updateData,
      { new: true, session }
    );
    return user;
  } catch (error) {
    console.error(`Error updating user by phone number ${phoneNumber}:`, error);
    throw error;
  }
}

module.exports = {
  courtRoomBook,
  loginToCourtRoom,
  getClientByPhoneNumber,
  getClientByUserid,
  storeCaseHistory,
  getSessionCaseHistory,
  addContactUsQuery,
  getClientByPhoneNumberWithSession,
  updateClientByPhoneNumberWithSession,
};

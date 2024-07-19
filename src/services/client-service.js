const { ClientRepository } = require("../repositories");
const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");
const {
  checkPassword,
  createToken,
  verifyToken,
} = require("../utils/common/auth");
const CourtRoomBooking = require("../models/courtRoomBooking");

const clientRepository = new ClientRepository();

async function courtRoomBook(userId, bookingDate, hour, password) {
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

    // Check if the user has already booked a courtroom at the same hour
    for (const courtroomBooking of booking.courtroomBookings) {
      if (courtroomBooking.userId.toString() === userId) {
        console.log(
          `User ${userId} has already booked a courtroom at ${hour}:00 on ${bookingDate.toDateString()}.`
        );
        return `User ${userId} has already booked a courtroom at ${hour}:00 on ${bookingDate.toDateString()}.`;
        // return res
        //   .status(400)
        //   .send(
        //     `User ${userId} has already booked a courtroom at ${hour}:00 on ${bookingDate.toDateString()}.`
        //   );
      }
    }

    // Check if the total bookings exceed the limit
    if (booking.courtroomBookings.length >= 4) {
      console.log(
        `Maximum of 4 courtrooms can be booked at ${hour}:00 on ${bookingDate.toDateString()}.`
      );
      return `Maximum of 4 courtrooms can be booked at ${hour}:00 on ${bookingDate.toDateString()}.`;
      // return res
      //   .status(400)
      //   .send(
      //     `Maximum of 4 courtrooms can be booked at ${hour}:00 on ${bookingDate.toDateString()}.`
      //   );
    }

    // Add the new booking
    booking.courtroomBookings.push({ userId, password });

    // Save the booking
    await booking.save();
    console.log("booking saved");
  } catch (error) {
    console.log(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
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

async function createClient(data) {
  try {
    const client = await clientRepository.create(data);
    const { jwt, expiresAt } = createToken({
      id: client.id,
      phoneNumber: client.phoneNumber,
    });
    return {
      client,
      jwt,
      expiresAt,
    };
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      throw new AppError(error.message, StatusCodes.CONFLICT);
    }
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function signin(data) {
  try {
    const client = await clientRepository.getClientByUsername(data.username);
    if (!client) {
      throw new AppError(
        "No user found for the given username",
        StatusCodes.NOT_FOUND
      );
    }
    const passwordMatch = checkPassword(data.password, client.password);
    if (!passwordMatch) {
      throw new AppError("Password do not match", StatusCodes.BAD_REQUEST);
    }
    const { jwt } = createToken({ id: client.id, email: client.email });
    return {
      jwt: jwt,
    };
  } catch (error) {
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getClientFromToken(token) {
  try {
    if (!token) {
      return new AppError("Missing jwt token", StatusCodes.BAD_REQUEST);
    }
    const response = verifyToken(token);
    const client = await clientRepository.getClientById(response.id);
    if (!client) {
      throw new AppError("No user found", StatusCodes.NOT_FOUND);
    }
    return client;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "Something went wrong",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

async function getClientByPhoneNumber(phoneNumber) {
  try {
    phoneNumber = phoneNumber.substring(3);
    const client = await clientRepository.getClientByPhoneNumber(phoneNumber);
    return client;
  } catch (error) {
    console.log(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getClientByPhoneNumberWithSession(phoneNumber, session) {
  try {
    const client = await clientRepository.getClientByPhoneNumberWithSession(
      phoneNumber,
      session
    );
    return client;
  } catch (error) {
    console.log(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getClientByPhoneNumbers(phoneNumbers) {
  try {
    const client = await clientRepository.getClientByPhoneNumbers(phoneNumbers);
    return client;
  } catch (error) {
    console.log(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getClientById(id) {
  try {
    const client = await clientRepository.getClientById(id);
    return client;
  } catch (error) {
    console.log(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function updateClientByPhoneNumberWithSession(
  phoneNumber,
  update,
  session
) {
  try {
    const client = await clientRepository.updateClientByPhoneNumberWithSession(
      phoneNumber,
      update,
      session
    );
    return client;
  } catch (error) {
    console.log(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function updateClient(id, data) {
  try {
    const client = await clientRepository.update(id, data);
    return client;
  } catch (error) {
    console.log(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function addPosttoClient(clientId, postId) {
  try {
    const client = await clientRepository.addPosttoClient(clientId, postId);
    return client;
  } catch (error) {
    console.log(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function deletePostfromClient(clientId, postId) {
  try {
    const client = await clientRepository.deletePostfromClient(
      clientId,
      postId
    );
    return client;
  } catch (error) {
    console.log(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getAllClientsDetails() {
  try {
    const clients = await clientRepository.getAllDetails();
    return clients;
  } catch (error) {
    console.log(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getAllClients() {
  try {
    const clients = await clientRepository.getAll();
    return clients;
  } catch (error) {
    console.log(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

module.exports = {
  createClient,
  signin,
  getClientFromToken,
  getClientById,
  updateClient,
  addPosttoClient,
  getAllClients,
  getAllClientsDetails,
  deletePostfromClient,
  getClientByPhoneNumber,
  getClientByPhoneNumbers,
  getClientByPhoneNumberWithSession,
  updateClientByPhoneNumberWithSession,
  courtRoomBook,
  getBookedData,
};

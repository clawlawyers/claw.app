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
    if (phoneNumber.startsWith("+")) {
      phoneNumber = phoneNumber.substring(3);
    }
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
};

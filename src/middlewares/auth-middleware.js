const {
  ClientService,
  UserService,
  CourtroomService,
  SpecificLawyerCourtroomService,
} = require("../services");
const { ErrorResponse } = require("../utils/common/");
const { StatusCodes } = require("http-status-codes");
const { verifyToken } = require("../utils/common/auth");
const AppError = require("../utils/errors/app-error");
const { verifyTokenCR } = require("../utils/coutroom/auth");

async function checkUserAuth(req, res, next) {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
      throw new AppError("Missing jwt token", StatusCodes.BAD_REQUEST);
    }
    const response = verifyToken(token);
    const user = await UserService.getUserById(response.id);
    if (!user) {
      throw new AppError("No user found", StatusCodes.NOT_FOUND);
    }
    req.body.user = user;
    next();
  } catch (error) {
    const errorResponse = ErrorResponse(error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function checkClientAuth(req, res, next) {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
      throw new AppError("Missing jwt token", StatusCodes.BAD_REQUEST);
    }
    const response = verifyToken(token);
    const client = await ClientService.getClientById(response.id);
    if (!client) {
      throw new AppError("No user found", StatusCodes.NOT_FOUND);
    }
    req.body.client = client;
    next();
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
  }
}

async function checkCourtroomAuth(req, res, next) {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    // console.log(token);
    if (!token) {
      throw new AppError("Missing jwt token", StatusCodes.BAD_REQUEST);
    }
    const response = verifyTokenCR(token);
    // console.log(response);
    const client = await CourtroomService.getClientByPhoneNumber(
      response.phoneNumber
    );
    if (!client) {
      throw new AppError("No user found", StatusCodes.NOT_FOUND);
    }
    console.log(client);
    req.body.courtroomClient = client;
    next();
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
  }
}

async function checkSpecificLawyerCourtroomAuth(req, res, next) {
  try {
    const clientIp =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const origin = req.headers.origin || req.headers.referer;

    // console.log("Client IP:", clientIp);
    // console.log("Origin:", origin);
    // console.log("Origin:", origin?.toString()?.substring(8));
    const domain = origin?.toString()?.substring(8);
    req.domain = domain;
    req.ip = clientIp;

    const client = await SpecificLawyerCourtroomService.getClientByDomainName(
      domain
    );
    if (!client) {
      throw new AppError("No user found", StatusCodes.NOT_FOUND);
    }
    // console.log(client);
    req.body.courtroomClient = client?.userBooking;
    next();
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
  }
}

async function checkVerifiedLawyer(req, res, next) {
  try {
    const lawyer = await UserService.getUserByPhoneNumber(req.body.phoneNumber);
    if (!lawyer) throw new AppError("No lawyer found", StatusCodes.NOT_FOUND);
    if (!lawyer.verified)
      throw new AppError("Please verify first", StatusCodes.FORBIDDEN);
    req.lawyer = lawyer;
    next();
  } catch (error) {
    return res.status(error.statusCode).json(ErrorResponse({}, error));
  }
}

async function checkRegisteredLawyer(req, res, next) {
  try {
    const lawyer = await UserService.getUserByPhoneNumber(req.body.phoneNumber);
    if (!lawyer || !lawyer.registered)
      throw new AppError(
        "Unauthorized, Please register first",
        StatusCodes.FORBIDDEN
      );
    req.lawyer = lawyer;
    next();
  } catch (error) {
    return res.status(error.statusCode).json(ErrorResponse({}, error));
  }
}

async function checkAmabassador(req, res, next) {
  const ambassador = req.body?.client?.ambassador;
  if (!ambassador)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "User not an ambassador" });
  return next();
}

module.exports = {
  checkUserAuth,
  checkClientAuth,
  checkVerifiedLawyer,
  checkRegisteredLawyer,
  checkAmabassador,
  checkCourtroomAuth,
  checkSpecificLawyerCourtroomAuth,
};

const { StatusCodes } = require("http-status-codes");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { ChatBotService } = require("../services");

async function getUserId(req, res) {
  try {
    const userId = await ChatBotService.getUserId();
    return res.status(StatusCodes.OK).json(SuccessResponse(userId));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function sendMessage(req, res) {
  try {
    const { userId, message } = req.body;
    const messageRes = await ChatBotService.chatUser({
      session_id: userId,
      message,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(messageRes));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function getContactUse(req, res) {
  try {
    const { userId, email, phone } = req.body;
    const resp = await ChatBotService.contactUs({
      session_id: userId,
      email,
      phone,
    });
    return res.status(StatusCodes.OK).json(SuccessResponse(resp));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function getEndSession(req, res) {
  try {
    const { userId } = req.body;
    const ends = await ChatBotService.endSession({ session_id: userId });
    return res.status(StatusCodes.OK).json(SuccessResponse(ends));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

module.exports = {
  getUserId,
  sendMessage,
  getContactUse,
  getEndSession,
};

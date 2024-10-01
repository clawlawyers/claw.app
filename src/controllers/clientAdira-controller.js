const { SuccessResponse, ErrorResponse } = require("../utils/common");

async function getUser(req, res) {
  try {
    const user = req.user;
    res.status(200).json(SuccessResponse({ user }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    console.log(error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function getMobileNumber(req, res) {
  try {
    const phoneNumber1 = req.user.phoneNumber;
    const { phoneNumber } = req.body;
    // console.log(req.user._id.toString());

    if (phoneNumber1 !== phoneNumber) {
      throw new Error("Invalid");
    }

    if (phoneNumber) res.status(200).json(SuccessResponse({ phoneNumber1 }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error.message);
    console.log(error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

module.exports = {
  getUser,
  getMobileNumber,
};

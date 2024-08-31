const { GptServices, ClientService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const Coupon = require("../models/coupon");
const Tracking = require("../models/tracking");
const moment = require("moment");
const CourtRoomBooking = require("../models/courtRoomBooking");
const TimeBasedBooking = require("../models/timeBasedBooking");

async function getBookingInfo(req, res) {
  try {
    const { _id } = req.client;

    const info = await TimeBasedBooking.findOne({ client: _id });
    if (!info) {
      return res.status(400).json({ error: "No booking found" });
    }
    return res.status(StatusCodes.OK).json(SuccessResponse({ fetchedData }));
  } catch {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function createNewBooking(req, res) {
  try {
    const { _id } = req.client;
    const endDate = new Date(req.endDate);
    if (endDate < Date.now()) {
      return res.status(400).json({ error: "cant book a previous day" });
    }

    const info = await TimeBasedBooking.findOne({ client: _id });

    if (info) {
      return res.status(400).json({ error: "Booking already exists" });
    }

    const data = {
      client: _id,
      endDate: endDate,
    };
    const booking = await TimeBasedBooking.create(data);
    return res.status(StatusCodes.OK).json({ mesage: "created" });
  } catch {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

async function updateBooking(req, res) {
  try {
    const { _id } = req.client;
    const endDate = new Date(req.endDate);

    const info = await TimeBasedBooking.findOne({ client: _id });

    if (!info) {
      return res.status(400).json({ error: "no Booking exists" });
    }
    if (info.startDate > endDate) {
      return res
        .status(400)
        .json({ error: "end date is less than start date" });
    }

    const booking = await TimeBasedBooking.findOneAndUpdate({
      endDate: endDate,
    });
    return res.status(StatusCodes.OK).json({ mesage: "created" });
  } catch {
    console.log(error);
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

module.exports = {
  getBookingInfo,
  createNewBooking,
  updateBooking,
};

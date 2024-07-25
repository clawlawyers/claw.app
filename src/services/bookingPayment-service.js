const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");
const BookingOrder = require("../models/bookingOrder");

async function createOrder(data) {
  try {
    const order = await BookingOrder.create(data);
    return order;
  } catch (error) {
    console.log(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
async function updateOrder(id, data) {
  try {
    const updatedOrder = await BookingOrder.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updatedOrder) {
      throw new AppError("Order not found", StatusCodes.NOT_FOUND);
    }
    return updatedOrder;
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function fetchOrderById(orderId) {
  try {
    const order = await BookingOrder.getById(orderId);
    return order;
  } catch (error) {
    console.error(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

module.exports = {
  createOrder,
  updateOrder,
  fetchOrderById,
};

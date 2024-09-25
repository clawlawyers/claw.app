const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/errors/app-error");
const { OrderRepository } = require("../repositories");

const orderRepository = new OrderRepository();

async function createOrder(data) {
  try {
    const order = await orderRepository.create(data);
    return order;
  } catch (error) {
    console.log(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
async function updateOrder(id, data) {
  try {
    const updatedOrder = await orderRepository.update(id, data);
    return updatedOrder;
  } catch (error) {
    console.log(error);
    throw new AppError(error.message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function fetchOrderById(orderId) {
  try {
    const order = await orderRepository.getById(orderId);
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

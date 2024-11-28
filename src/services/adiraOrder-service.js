const AdiraPlanOrder = require("../models/adiraPlanOrder");

async function createOrder(order) {
  try {
    const newOrder = await AdiraPlanOrder.create(order);
    return newOrder;
  } catch (error) {
    console.log(error);
    throw new Error("Error while creating order");
  }
}

async function updateOrder(orderId, updateOrder) {
  try {
    const updatedOrder = await AdiraPlanOrder.findByIdAndUpdate(
      orderId,
      updateOrder
    );
    return updatedOrder;
  } catch (error) {
    console.log(error);
    throw new Error("Error while updating order");
  }
}

module.exports = { createOrder, updateOrder };

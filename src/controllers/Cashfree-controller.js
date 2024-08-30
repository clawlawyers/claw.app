const {
  CASHFREE_URL,
  CASHFREE_CLIENT_ID,
  CASHFREE_CLIENT_SECRET,
} = require("../config/server-config");
const { OrderService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const { paymentStatus } = require("../utils/common/constants");

async function createOrder(req, res) {
  try {
    const { amount, plan, request, session, billingCycle } = req.body;
    console.log(req.body);
    const { _id, phoneNumber } = req.body.client;
    // create order
    const order = await OrderService.createOrder({
      plan,
      request,
      session,
      billingCycle,
      user: _id,
      paymentStatus: paymentStatus.INITIATED,
    });
    // Create a order with the order amount and currency
    const response = await fetch(`${CASHFREE_URL}/orders`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": CASHFREE_CLIENT_ID,
        "x-client-secret": CASHFREE_CLIENT_SECRET,
      },
      body: JSON.stringify({
        customer_details: {
          customer_id: _id.toString(),
          customer_phone: phoneNumber,
        },
        order_id: order._id.toString(),
        order_amount: amount,
        order_currency: "INR",
      }),
    });

    const { payment_session_id } = await response.json();
    console.log({ payment_session_id });
    res
      .status(StatusCodes.CREATED)
      .json(
        SuccessResponse({ payment_session_id, order_id: order._id.toString() })
      );
  } catch (error) {
    console.log(error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse({}, error));
  }
}

module.exports = { createOrder };

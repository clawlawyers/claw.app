const { RAZORPAY_ID, RAZORPAY_SECRET_KEY } = require("../config/server-config");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { OrderService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const { paymentStatus } = require("../utils/common/constants");
const { GptServices } = require("../services");

const razorpay = new Razorpay({
  key_id: RAZORPAY_ID,
  key_secret: RAZORPAY_SECRET_KEY,
});

async function createPayment(req, res) {
  const { amount, currency, receipt, plan, billingCycle, request, session } =
    req.body;
  // const { _id, phoneNumber } = req.body.client;

  const order = await OrderService.createOrder({
    plan,
    request,
    session,
    billingCycle,
    user: "667c458610b669f89ebe5b76",
    paymentStatus: paymentStatus.INITIATED,
  });

  try {
    const options = {
      amount: amount * 100,
      currency,
      receipt,
    };

    const orderr = await razorpay.orders.create(options);
    const combinedResponse = {
      razorpayOrder: orderr,
      createdOrder: order,
    };
    console.log(combinedResponse);
    res.status(200).json(combinedResponse);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, _id } =
    req.body;

  const hmac = crypto.createHmac("sha256", RAZORPAY_SECRET_KEY);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest("hex");

  if (generated_signature === razorpay_signature) {
    try {
      const placedOrder = await OrderService.updateOrder(_id, {
        paymentStatus: paymentStatus.SUCCESS,
      });
      // update the plan for user
      console.log(placedOrder.user.toString(), placedOrder.plan);
      const rs = await GptServices.updateUserPlan(
        placedOrder.user.toString(),
        placedOrder.plan
      );
      console.log(rs);
      res.status(200).json({ status: "Payment verified successfully" });
    } catch (error) {
      console.log(error);
    }
  } else {
    res.status(400).json({ status: "Payment verification failed" });
  }
}

module.exports = {
  createPayment,
  verifyPayment,
};

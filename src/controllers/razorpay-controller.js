const { RAZORPAY_ID, RAZORPAY_SECRET_KEY } = require("../config/server-config");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { OrderService, ClientService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const { paymentStatus } = require("../utils/common/constants");
const { GptServices } = require("../services");

const razorpay = new Razorpay({
  key_id: RAZORPAY_ID,
  key_secret: RAZORPAY_SECRET_KEY,
});

// planNamesquence = ["BASIC_M", "ESSENTIAL_M", "BASIC_Y", "ESSENTIAL_Y"];
planNamesquence = [
  { name: "BASIC_M", price: 399, index: 0 },
  { name: "BASIC_Y", price: 3999, index: 1 },
  { name: "ESSENTIAL_M", price: 1199, index: 2 },
  { name: "ESSENTIAL_Y", price: 11999, index: 3 },
  { name: "PREMIUM_M", price: 1999, index: 4 },
  { name: "PREMIUM_Y", price: 19999, index: 5 },
];

async function createPayment(req, res) {
  const {
    amount,
    currency,
    receipt,
    plan,
    billingCycle,
    session,
    phoneNumber,
  } = req.body;
  // const { _id, phoneNumber } = req.body.client;
  console.log(req.body);

  const fetchUser = await ClientService.getClientByPhoneNumber(phoneNumber);

  console.log(fetchUser._id.toHexString());

  const order = await OrderService.createOrder({
    plan,
    session,
    billingCycle,
    user: fetchUser._id,
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
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    _id,
    isUpgrade,
    createdAt,
  } = req.body;

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
        placedOrder.plan,
        isUpgrade,
        createdAt,
        expiresAt
      );

      console.log(rs);
    } catch (error) {
      console.log(error);
    }
    res.status(200).json({ status: "Payment verified successfully" });
  } else {
    res.status(400).json({ status: "Payment verification failed" });
  }
}

async function finalPrice(req, res) {
  try {
    const { planName, userId } = req.body;

    let plans = await prisma.newUserPlan.findMany({
      where: {
        userId: userId,
      },
      include: {
        plan: true,
      },
    });

    const existing = planNamesquence.find((p) => p.name === plans[0].plan.name);
    const newOne = planNamesquence.find((p) => p.name === planName);

    console.log(existing, newOne);

    if (newOne.index > existing.index) {
      console.log("new plan will added");
      // const existingPrice = planNamesquence[existing.index].price;
      const existingPrice = existing.price;
      const newPrice = newOne.price;
      const duration = plans[0].plan.duration;
      const planCreateData = new Date(plans[0].createdAt);
      const now = new Date();
      const daysUsed = Math.floor(
        (now - planCreateData) / (1000 * 60 * 60 * 24)
      ); // Days used

      console.log(planCreateData, now);

      console.log(daysUsed);

      const durationInDays = duration === "monthly" ? 30 : 360;

      console.log(durationInDays);

      const remainingDays = durationInDays - daysUsed;

      console.log(remainingDays);

      // Calculate the prorated remaining value of the current plan
      const remainingValue = (remainingDays / durationInDays) * existingPrice;

      // Final price for the upgraded plan
      const finalPrice = newPrice - remainingValue;

      console.log(finalPrice);

      res
        .status(201)
        .json({ finalPrice: finalPrice.toFixed(2), isUpgrade: true });
    } else {
      res.status(200).json({ finalPrice: newOne.price, isUpgrade: false });
    }

    // console.log(plans);
  } catch (error) {
    console.error(error);
    const errorResponse = ErrorResponse({}, error.message);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
}

module.exports = {
  createPayment,
  verifyPayment,
  finalPrice,
};

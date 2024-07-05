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

async function createPayment(req, res) {
  const {
    amount,
    currency,
    receipt,
    plan,
    billingCycle,
    request,
    session,
    phoneNumber,
  } = req.body;
  // const { _id, phoneNumber } = req.body.client;
  console.log(req.body);

  const fetchUser = await ClientService.getClientByPhoneNumber(phoneNumber);

  console.log(fetchUser._id.toHexString());

  const order = await OrderService.createOrder({
    plan,
    request,
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
      const Pdata = await prisma.plan.findUnique({
        where: { name: placedOrder.plan },
      });

      // console.log(plansData);
      let totalGptTokens = Pdata.gptToken;
      let totalCaseSearchTokens = Pdata.caseSearchToken;

      console.log(totalGptTokens, totalCaseSearchTokens);

      const updatedUser = await prisma.user.update({
        where: {
          mongoId: placedOrder.user.toString(),
        },
        data: {
          totalGptTokens: {
            increment: totalGptTokens, // or any other value you want to increment by
          },
          totalCaseSearchTokens: {
            increment: totalCaseSearchTokens, // or any other value you want to increment by
          },
        },
      });

      console.log(updatedUser);
    } catch (error) {
      console.log(error);
    }
    res.status(200).json({ status: "Payment verified successfully" });
  } else {
    res.status(400).json({ status: "Payment verification failed" });
  }
}

module.exports = {
  createPayment,
  verifyPayment,
};

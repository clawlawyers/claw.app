const { RAZORPAY_ID, RAZORPAY_SECRET_KEY } = require("../config/server-config");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { BookingPayment, CourtroomService } = require("../services");
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const { paymentStatus } = require("../utils/common/constants");
const { hashPassword } = require("../utils/coutroom/auth");
const { sendConfirmationEmail } = require("../utils/coutroom/sendEmail");

const razorpay = new Razorpay({
  key_id: RAZORPAY_ID,
  key_secret: RAZORPAY_SECRET_KEY,
});

async function createPayment(req, res) {
  const { amount, currency, receipt, numberOfSlot, phoneNumber } = req.body;
  // const { _id, phoneNumber } = req.body.client;
  console.log(req.body);

  //   const fetchUser = await ClientService.getClientByPhoneNumber(phoneNumber);

  //   console.log(fetchUser._id.toHexString());

  const order = await BookingPayment.createOrder({
    phoneNumber,
    numberOfSlot,
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
    bookingData,
  } = req.body;

  const hmac = crypto.createHmac("sha256", RAZORPAY_SECRET_KEY);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest("hex");

  if (generated_signature === razorpay_signature) {
    try {
      console.log(_id);
      const placedOrder = await BookingPayment.updateOrder(_id, {
        paymentStatus: paymentStatus.SUCCESS,
      });

      // update the plan for user
      console.log(placedOrder);
      // const rs = await GptServices.updateUserPlan(
      //   placedOrder.user.toString(),
      //   placedOrder.plan
      // );

      const { name, phoneNumber, email, password, slots, recording } =
        bookingData;

      // Check if required fields are provided
      if (
        !name ||
        !phoneNumber ||
        !email ||
        !password ||
        !slots ||
        !Array.isArray(slots) ||
        slots.length === 0
      ) {
        return res.status(400).send("Missing required fields.");
      }

      const hashedPassword = await hashPassword(password);

      for (const slot of slots) {
        const { date, hour } = slot;
        if (!date || hour === undefined) {
          return res.status(400).send("Missing required fields in slot.");
        }

        const bookingDate = new Date(date);

        const respo = await CourtroomService.courtRoomBook(
          name,
          phoneNumber,
          email,
          hashedPassword,
          bookingDate,
          hour,
          recording
        );

        if (respo) {
          return res.status(400).send(respo);
        }
      }
      await sendConfirmationEmail(email);
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

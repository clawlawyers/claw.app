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

const LiveplanNamesquence = [
  { name: "BASIC_M", price: 399, id: "plan_OvrQPqMurmW9P2" },
  { name: "BASIC_Y", price: 3999, id: "plan_OvrS1uLssYZZ5A" },
  { name: "ESSENTIAL_M", price: 1199, id: "plan_OvrQvRwtnJhEpo" },
  { name: "ESSENTIAL_Y", price: 11999, id: "plan_OvrSVyFS74Lgbr" },
  { name: "PREMIUM_M", price: 1999, id: "plan_OvrRWAtQRSoKHu" },
  { name: "PREMIUM_Y", price: 19999, id: "plan_OvrSvJaxOqEuxG" },
  { name: "ADDON_M", price: 899, id: "plan_OvrTcADlxAi3Fq" },
];

const LiveOfferplanNamesquence = [
  { name: "BASIC_M", price: 199, id: "plan_OydA5Ekx6q2Cvf" },
  { name: "BASIC_Y", price: 1999, id: "plan_OydYkw0YXrKu4N" },
  { name: "ESSENTIAL_M", price: 699, id: "plan_OydAxwpAvxG0L0" },
  { name: "ESSENTIAL_Y", price: 6999, id: "plan_OydhV1HSz1IwWc" },
  { name: "PREMIUM_M", price: 1199, id: "plan_OydT8PYPUZzwNJ" },
  { name: "PREMIUM_Y", price: 11999, id: "plan_OyditM9Is1AREu" },
];

const planNamesquence = [
  { name: "BASIC_M", price: 399, id: "plan_OvslHBSlbwE1lM" },
  { name: "BASIC_Y", price: 3999, id: "plan_OvsmK9WNPatC33" },
  { name: "ESSENTIAL_M", price: 1199, id: "plan_OvsmWrzM694xvr" },
  { name: "ESSENTIAL_Y", price: 11999, id: "plan_OvsmpBeBxh8SS5" },
  { name: "PREMIUM_M", price: 1999, id: "plan_Ovsn4BAGrxqz7V" },
  { name: "PREMIUM_Y", price: 19999, id: "plan_OvsnLSAarhWgJg" },
  { name: "ADDON_M", price: 899, id: "plan_OvsnZFctyVRhn5" },
];

const OfferplanNamesquence = [
  { name: "BASIC_M", price: 199, id: "plan_OxqVBZBd8zgPzl" },
  { name: "BASIC_Y", price: 1999, id: "plan_OxqVfzDcqf1qey" },
  { name: "ESSENTIAL_M", price: 699, id: "plan_OxqWsZ3onTMiHw" },
  { name: "ESSENTIAL_Y", price: 6999, id: "plan_OxqXInXr75GmLt" },
  { name: "PREMIUM_M", price: 1199, id: "plan_OxqXiIPa0szExN" },
  { name: "PREMIUM_Y", price: 11999, id: "plan_OydlmF2HCHk2cI" },
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
    createdAt,
    expiresAt,
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
        razorpay_order_id,
        (existingSubscription = ""),
        createdAt,
        (refferalCode = null),
        (couponCode = ""),
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

// Create subscription
async function createSubscription(req, res) {
  const { plan, billingCycle, session, phoneNumber, trialDays, isDiscount } =
    req.body;

  try {
    const fetchUser = await ClientService.getClientByPhoneNumber(phoneNumber);

    const createdOrder = await OrderService.createOrder({
      plan,
      session,
      billingCycle,
      user: fetchUser._id,
      paymentStatus: paymentStatus.INITIATED,
    });

    let Backendplan;

    if (isDiscount) {
      Backendplan = OfferplanNamesquence.find((p) => p.name === plan);
    } else {
      Backendplan = planNamesquence.find((p) => p.name === plan);
    }

    let updatedTimeInSeconds;

    if (trialDays) {
      let currentTimeInSeconds = Math.floor(Date.now() / 1000); // Current time in seconds
      let date = new Date(currentTimeInSeconds * 1000); // Convert to milliseconds and create a Date object

      // Modify only the date part (e.g., add 7 days)
      date.setDate(date.getDate() + trialDays);

      // Get the updated timestamp (time remains unchanged)
      updatedTimeInSeconds = Math.floor(date.getTime() / 1000);
    } else {
      let currentTimeInSeconds = Math.floor(Date.now() / 1000); // Current time in seconds

      // Add 5 minutes (300 seconds) to the current time
      updatedTimeInSeconds = currentTimeInSeconds + 120;
    }

    const subscriptionOptions = {
      plan_id: Backendplan.id, // Razorpay Plan ID from dashboard
      customer_notify: 1,
      // total_count: billingCycle === "MONTHLY" ? 12 : 1, // Monthly or yearly billing
      start_at: updatedTimeInSeconds,
      end_at: Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60, // Set an end date 10 years from now
      // offer_id:k "offer_OwvYlKUwvJg4yc",
      notes: {
        user_id: fetchUser._id,
      },
    };

    console.log(subscriptionOptions);

    // Create a subscription on Razorpay
    const razorpaySubscription = await razorpay.subscriptions.create(
      subscriptionOptions
    );

    console.log("Razorpay subscription:", razorpaySubscription);

    console.log(razorpaySubscription);

    const combinedResponse = {
      razorpaySubscription,
      createdOrder,
      // orderId, // Send back the first order ID
    };

    res.status(200).json(combinedResponse);
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: "Subscription creation failed" });
  }
}

// Verify subscription payment

async function verifySubscription(req, res) {
  let {
    existingSubscription,
    razorpay_subscription_id,
    razorpay_payment_id,
    razorpay_signature,
    _id,
    createdAt,
    refferalCode,
    couponCode,
  } = req.body;

  console.log("Subscription ID:", razorpay_subscription_id);
  console.log("Payment ID:", razorpay_payment_id);
  console.log("Received Razorpay Signature:", razorpay_signature);

  // Generate signature for verification
  const generatedSignature = crypto
    .createHmac("sha256", RAZORPAY_SECRET_KEY)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest("hex");

  console.log("Generated Signature:", generatedSignature);

  if (generatedSignature === razorpay_signature) {
    try {
      if (existingSubscription) {
        // Step 1: Cancel the existing subscription
        const canceledSubscription = await razorpay.subscriptions.cancel(
          existingSubscription
        );

        console.log("Canceled Subscription:", canceledSubscription);
        if (
          canceledSubscription.total_count -
          canceledSubscription.remaining_count
        ) {
          console.log(new Date(canceledSubscription.current_end * 1000)); // use
          console.log(new Date(canceledSubscription.start_at * 1000)); // use

          const endDate = new Date(canceledSubscription.current_end * 1000);

          const currentDate = new Date();

          const planId = canceledSubscription.plan_id;
          let plan = planNamesquence.find((p) => p.id === planId);

          if (!plan) {
            plan = OfferplanNamesquence.find((p) => p.id === planId);
          }

          const onedayPrice =
            plan.price / (plan.name.split("_")[1] === "M" ? 30 : 365);

          const totalDaysBetweenEndAndCurrent = Math.floor(
            (endDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)
          );

          const refundMoney = totalDaysBetweenEndAndCurrent * onedayPrice;

          const invoices = await razorpay.invoices.all({
            subscription_id: existingSubscription, // Filter by subscription ID
          });

          console.log("Invoices related to subscription:", invoices);

          const paymentId = invoices.items[0].payment_id;

          // Step 3: Refund the custom amount (if applicable)
          if (refundMoney > 0) {
            const refund = await razorpay.payments.refund(paymentId, {
              amount: refundMoney, // Refund amount in paise
            });

            console.log("Refund processed:", refund);
          }
        }
      }

      // Step 4: Update order status to SUCCESS
      const placedOrder = await OrderService.updateOrder(_id, {
        paymentStatus: paymentStatus.SUCCESS,
      });

      const subscription = await razorpay.subscriptions.fetch(
        razorpay_subscription_id
      );

      let expiresAt =
        subscription.current_end === null
          ? subscription.charge_at
          : subscription.current_end;

      expiresAt = new Date(expiresAt * 1000);

      // Step 5: Update the user plan after subscription success
      await GptServices.updateUserPlan(
        placedOrder.user.toString(),
        placedOrder.plan,
        razorpay_subscription_id,
        existingSubscription,
        createdAt,
        refferalCode,
        couponCode,
        expiresAt
      );

      res.status(200).json({
        status:
          "Payment verified, subscription updated, and refund processed successfully",
      });
    } catch (error) {
      console.error("Error in processing subscription or refund:", error);
      res
        .status(500)
        .json({ error: "Internal server error during subscription or refund" });
    }
  } else {
    console.error("Signature verification failed");
    res.status(400).json({ status: "Payment verification failed" });
  }
}

async function rezorpayWebhook(req, res) {
  const event = req.body.event;
  const data = req.body.payload;

  try {
    if (event === "subscription.charged" || event === "invoice.paid") {
      // Successful subscription or invoice payment
      const subscriptionId = data.subscription.entity.id;
      const userId = data.subscription.entity.notes.user_id;
      const currentEndTimestamp = data.subscription.entity.current_end;
      const subscriptionEndDate = new Date(currentEndTimestamp * 1000);
      // Check the paid count in the subscription entity
      const paidCount = data.subscription.entity.paid_count;

      if (paidCount === 1) {
        // This is the first payment, as the paid count is 1

        await GptServices.handleFirstPayment(userId, subscriptionId);
      }

      // Update the user's subscription as active and set the new end date
      await GptServices.updateUserSubscription(
        userId,
        subscriptionId,
        (isActive = true),
        subscriptionEndDate
      );

      res.status(200).json({ message: "Subscription updated successfully" });
    } else if (
      event === "invoice.payment_failed" ||
      event === "subscription.halted"
    ) {
      // Payment failure or subscription halt event
      const userId = data.subscription.entity.notes.user_id;
      const subscriptionId = data.subscription.entity.id;

      // Mark the user's subscription as inactive
      await updateUserSubscription(userId, subscriptionId, (isActive = false));

      res.status(200).json({
        message: "Subscription marked as inactive due to payment failure",
      });
    } else {
      res.status(400).json({ message: "Unhandled event type" });
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
}

module.exports = {
  createPayment,
  verifyPayment,
  createSubscription,
  verifySubscription,
  rezorpayWebhook,
};

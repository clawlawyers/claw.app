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
  { name: "BASIC_M", price: 399, id: "plan_OvslHBSlbwE1lM" },
  { name: "BASIC_Y", price: 3999, id: "plan_OvsmK9WNPatC33" },
  { name: "ESSENTIAL_M", price: 1199, id: "plan_OvsmWrzM694xvr" },
  { name: "ESSENTIAL_Y", price: 11999, id: "plan_OvsmpBeBxh8SS5" },
  { name: "PREMIUM_M", price: 1999, id: "plan_Ovsn4BAGrxqz7V" },
  { name: "PREMIUM_Y", price: 19999, id: "plan_OvsnLSAarhWgJg" },
  { name: "ADDON_M", price: 19999, id: "plan_OvsnZFctyVRhn5" },
];

OfferplanNamesquence = [
  { name: "BASIC_M", price: 199, id: "plan_OxqVBZBd8zgPzl" },
  { name: "BASIC_Y", price: 1999, id: "plan_OxqVfzDcqf1qey" },
  { name: "ESSENTIAL_M", price: 699, id: "plan_OxqWsZ3onTMiHw" },
  { name: "ESSENTIAL_Y", price: 6999, id: "plan_OxqXInXr75GmLt" },
  { name: "PREMIUM_M", price: 1199, id: "plan_OxqXiIPa0szExN" },
  { name: "PREMIUM_Y", price: 6999, id: "plan_OxqY56Csjdo46R" },
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
        createdAt
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

// Function to get the next due date for a subscription
const get_next_due_date = async (subscription_id) => {
  try {
    const subscription = await razorpay.subscriptions.fetch(subscription_id);
    console.log(subscription);

    const next_due_date = new Date(subscription.current_end * 1000); // convert timestamp to readable date

    return next_due_date;
  } catch (error) {
    console.error("Error fetching subscription details:", error);
    throw new Error("Failed to retrieve subscription information");
  }
};

// Example usage
// const subscription_id = "sub_OxcufCqcf4vsq6"; // Replace with the actual subscription ID
// get_next_due_date(subscription_id)
//   .then((next_due_date) => {
//     console.log("Next due date:", next_due_date);
//   })
//   .catch((error) => {
//     console.error("Error:", error.message);
//   });

// Create subscription
async function createSubscription(req, res) {
  const { plan, billingCycle, session, phoneNumber, trialDays } = req.body;

  try {
    const fetchUser = await ClientService.getClientByPhoneNumber(phoneNumber);

    const createdOrder = await OrderService.createOrder({
      plan,
      session,
      billingCycle,
      user: fetchUser._id,
      paymentStatus: paymentStatus.INITIATED,
    });

    Backendplan = planNamesquence.find((p) => p.name === plan);

    const subscriptionOptions = {
      plan_id: Backendplan.id, // Razorpay Plan ID from dashboard
      customer_notify: 1,
      // total_count: billingCycle === "MONTHLY" ? 12 : 1, // Monthly or yearly billing
      start_at: Math.floor(Date.now() / 1000) + trialDays * 24 * 60 * 60, // Start 7 days from now
      end_at: Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60, // Set an end date 10 years from now
      // offer_id: "offer_OwvYlKUwvJg4yc",
      notes: {
        user_id: fetchUser._id,
      },
    };

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
    refundAmount,
    existingSubscription,
    razorpay_subscription_id,
    razorpay_payment_id,
    razorpay_signature,
    _id,
    isUpgrade,
    createdAt,
    trialDays,
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
      existingSubscription = "sub_OxoPELYapCauog";
      refundAmount = 686;
      if (existingSubscription) {
        // Step 1: Cancel the existing subscription
        const canceledSubscription = await razorpay.subscriptions.cancel(
          existingSubscription
        );

        console.log("Canceled Subscription:", canceledSubscription);

        if (canceledSubscription.paid_count) {
          const invoices = await razorpay.invoices.all({
            subscription_id: existingSubscription, // Filter by subscription ID
          });

          console.log("Invoices related to subscription:", invoices);

          const paymentId = invoices.items[0].payment_id;

          // Step 3: Refund the custom amount (if applicable)
          if (refundAmount > 0) {
            const refund = await razorpay.payments.refund(paymentId, {
              amount: refundAmount, // Refund amount in paise
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
        isUpgrade,
        createdAt,
        trialDays,
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

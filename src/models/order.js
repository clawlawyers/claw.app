const mongoose = require("mongoose");
const { paymentStatus, billingCycles } = require("../utils/common/constants");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "Client",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: [
        paymentStatus.INITIATED,
        paymentStatus.SUCCESS,
        paymentStatus.FAILED,
      ],
      required: true,
    },
    plan: {
      type: String,
      required: true,
      trim: true,
    },
    request: {
      type: Number,
    },
    session: {
      type: Number,
      required: true,
    },
    billingCycle: {
      type: String,
      enum: [
        billingCycles.MONTHLY,
        billingCycles.YEARLY,
        billingCycles.LIFETIME,
      ],
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Orders = new mongoose.model("Order", orderSchema);

module.exports = Orders;

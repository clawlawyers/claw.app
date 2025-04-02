const mongoose = require("mongoose");
const {
  paymentStatus,
  billingCycles,
  AdiraBillingCycles,
} = require("../utils/common/constants");

const AdiraPlanOrderSchema = new mongoose.Schema(
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
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
    },
    billingCycle: {
      type: String,
      enum: [
        AdiraBillingCycles.MONTHLY,
        AdiraBillingCycles.DAILY,
        AdiraBillingCycles.WEEKLY,
      ],
      required: true,
      trim: true,
    },
    currencyType: {
      type: String,
      trim: true,
      default: "INR",
    },
  },
  { timestamps: true }
);

const AdiraPlanOrder = new mongoose.model(
  "AdiraPlanOrder",
  AdiraPlanOrderSchema
);

module.exports = AdiraPlanOrder;

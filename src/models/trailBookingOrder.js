const mongoose = require("mongoose");
const { paymentStatus } = require("../utils/common/constants");

const TrailbookingOrderSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
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
    numberOfSlot: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const TrailBookingOrder = new mongoose.model(
  "TrailBookingOrder",
  TrailbookingOrderSchema
);

module.exports = TrailBookingOrder;

const mongoose = require("mongoose");
const { paymentStatus } = require("../utils/common/constants");

const bookingOrderSchema = new mongoose.Schema(
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

const BookingOrder = new mongoose.model("BookingOrder", bookingOrderSchema);

module.exports = BookingOrder;

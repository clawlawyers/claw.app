const mongoose = require("mongoose");

const trialCourtroomCouponSchema = new mongoose.Schema({
  CouponCode: {
    type: String,
    required: true,
    unique: true,
  },
  totalSlots: {
    type: Number,
    required: true,
  },
  bookedSlots: {
    type: Number,
    default: 0,
  },
  StartDate: { type: Date, required: true },
  EndDate: { type: Date, required: true },
  courtroomBookings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrailCourtroomUser2",
      required: true,
    },
  ],
});

const TrialCourtroomCoupon = mongoose.model(
  "TrialCourtroomCoupon",
  trialCourtroomCouponSchema
);

module.exports = TrialCourtroomCoupon;

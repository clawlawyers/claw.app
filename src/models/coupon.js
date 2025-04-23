const mongoose = require("mongoose");

const couponAnalyticsSchema = new mongoose.Schema({
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  usedAt: { type: Date, default: Date.now },
  orderAmount: { type: Number },
  discountApplied: { type: Number },
});

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["PERCENTAGE", "FIXED", "TRIAL", "SPECIAL"],
    default: "PERCENTAGE",
  },
  category: {
    type: String,
    required: true,
    enum: ["NEW_USER", "SEASONAL", "PREMIUM", "REFERRAL"],
    default: "NEW_USER",
  },
  discount: {
    type: Number,
    required: true,
    min: [0, "Discount cannot be negative"],
    max: [100, "Discount cannot exceed 100%"],
  },
  minPurchaseAmount: {
    type: Number,
    default: 0,
  },
  maxDiscountAmount: {
    type: Number,
  },
  usageLimit: {
    perUser: { type: Number, default: 1 },
    total: { type: Number, required: true },
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  expirationDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  description: { type: String },
  analytics: [couponAnalyticsSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update the updatedAt timestamp
couponSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtual field for remaining usage
couponSchema.virtual("remainingUsage").get(function () {
  return this.usageLimit.total - this.usageCount;
});

// Method to check if coupon is valid for use
couponSchema.methods.isValidForUse = function (orderAmount, userId) {
  const now = new Date();

  if (!this.isActive) return { valid: false, reason: "Coupon is inactive" };
  if (now > this.expirationDate)
    return { valid: false, reason: "Coupon has expired" };
  if (this.usageCount >= this.usageLimit.total)
    return { valid: false, reason: "Coupon usage limit reached" };
  if (orderAmount < this.minPurchaseAmount)
    return {
      valid: false,
      reason: `Minimum purchase amount is ${this.minPurchaseAmount}`,
    };

  const userUsage = this.analytics.filter(
    (a) => a.usedBy.toString() === userId.toString()
  ).length;
  if (userUsage >= this.usageLimit.perUser)
    return { valid: false, reason: "You have already used this coupon" };

  return { valid: true };
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function (orderAmount) {
  let discountAmount;

  if (this.type === "PERCENTAGE") {
    discountAmount = (orderAmount * this.discount) / 100;
    if (this.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, this.maxDiscountAmount);
    }
  } else if (this.type === "FIXED") {
    discountAmount = this.discount;
  }

  return Math.min(discountAmount, orderAmount);
};

module.exports = mongoose.model("Coupon", couponSchema);

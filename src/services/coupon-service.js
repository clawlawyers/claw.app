const Coupon = require('../models/coupon');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

class CouponService {
  static async createCoupon(couponData) {
    try {
      const coupon = new Coupon(couponData);
      await coupon.save();
      return coupon;
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError('Coupon code already exists', StatusCodes.CONFLICT);
      }
      throw new AppError('Error creating coupon', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  static async validateAndApplyCoupon(code, orderAmount, userId) {
    try {
      const coupon = await Coupon.findOne({ code: code.toUpperCase() });
      
      if (!coupon) {
        throw new AppError('Coupon not found', StatusCodes.NOT_FOUND);
      }

      const validationResult = coupon.isValidForUse(orderAmount, userId);
      if (!validationResult.valid) {
        throw new AppError(validationResult.reason, StatusCodes.BAD_REQUEST);
      }

      const discountAmount = coupon.calculateDiscount(orderAmount);
      
      return {
        coupon,
        discountAmount,
        finalAmount: orderAmount - discountAmount
      };
    } catch (error) {
      throw error instanceof AppError ? error : new AppError('Error validating coupon', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  static async recordCouponUsage(couponId, userId, orderAmount, discountApplied) {
    try {
      const coupon = await Coupon.findById(couponId);
      
      if (!coupon) {
        throw new AppError('Coupon not found', StatusCodes.NOT_FOUND);
      }

      coupon.analytics.push({
        usedBy: userId,
        orderAmount,
        discountApplied
      });
      
      coupon.usageCount += 1;
      await coupon.save();

      return coupon;
    } catch (error) {
      throw new AppError('Error recording coupon usage', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  static async getCouponAnalytics(couponId) {
    try {
      const coupon = await Coupon.findById(couponId)
        .populate('analytics.usedBy', 'name email');

      if (!coupon) {
        throw new AppError('Coupon not found', StatusCodes.NOT_FOUND);
      }

      const analytics = {
        totalUsage: coupon.usageCount,
        remainingUsage: coupon.remainingUsage,
        totalDiscountGiven: coupon.analytics.reduce((sum, record) => sum + record.discountApplied, 0),
        averageOrderValue: coupon.analytics.reduce((sum, record) => sum + record.orderAmount, 0) / coupon.analytics.length,
        usageHistory: coupon.analytics.map(record => ({
          user: record.usedBy,
          usedAt: record.usedAt,
          orderAmount: record.orderAmount,
          discountApplied: record.discountApplied
        }))
      };

      return analytics;
    } catch (error) {
      throw new AppError('Error fetching coupon analytics', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = CouponService;
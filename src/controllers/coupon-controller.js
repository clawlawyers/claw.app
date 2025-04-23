const CouponService = require('../services/coupon-service');
const { StatusCodes } = require('http-status-codes');

class CouponController {
  static async createCoupon(req, res) {
    try {
      const coupon = await CouponService.createCoupon(req.body);
      return res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon
      });
    } catch (error) {
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  static async applyCoupon(req, res) {
    try {
      const { code, orderAmount } = req.body;
      const userId = req.user.id; // Assuming user info is added by auth middleware

      const result = await CouponService.validateAndApplyCoupon(
        code,
        orderAmount,
        userId
      );

      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Coupon applied successfully',
        data: result
      });
    } catch (error) {
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  static async recordUsage(req, res) {
    try {
      const { couponId, orderAmount, discountApplied } = req.body;
      const userId = req.user.id;

      const result = await CouponService.recordCouponUsage(
        couponId,
        userId,
        orderAmount,
        discountApplied
      );

      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Coupon usage recorded successfully',
        data: result
      });
    } catch (error) {
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getAnalytics(req, res) {
    try {
      const { couponId } = req.params;
      const analytics = await CouponService.getCouponAnalytics(couponId);

      return res.status(StatusCodes.OK).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = CouponController;
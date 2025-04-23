const express = require('express');
const router = express.Router();
const CouponController = require('../controllers/coupon-controller');
const { checkUserAuth, checkAdminAuth } = require('../middlewares/auth-middleware');

// Admin routes
router.post('/create', checkAdminAuth, CouponController.createCoupon);
router.get('/analytics/:couponId', checkAdminAuth, CouponController.getAnalytics);

// User routes
router.post('/apply', checkUserAuth, CouponController.applyCoupon);
router.post('/record-usage', checkUserAuth, CouponController.recordUsage);

module.exports = router;
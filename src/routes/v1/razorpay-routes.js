// server/routes/salesman.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares");
const RazorpayController = require("../../controllers/razorpay-controller");

router.post("/create-order", RazorpayController.createPayment);
router.post("/verifyPayment", RazorpayController.verifyPayment);

router.post("/create-subscription", RazorpayController.createSubscription);
router.post("/verify-subscription", RazorpayController.verifySubscription);

router.post("/razorpay-webhook", RazorpayController.rezorpayWebhook);

module.exports = router;

// server/routes/salesman.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares");
const RazorpayController = require("../../controllers/razorpay-controller");

router.post(
  "/create-order",

  RazorpayController.createPayment
);
router.post(
  "/verifyPayment",

  RazorpayController.verifyPayment
);

module.exports = router;

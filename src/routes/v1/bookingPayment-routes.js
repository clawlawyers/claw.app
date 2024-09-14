// server/routes/salesman.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares");
const bookingPayementController = require("../../controllers/bookingPayement-controller");

router.post(
  "/create-order",

  bookingPayementController.createPayment
);
router.post(
  "/verifyPayment",

  bookingPayementController.verifyPayment
);

module.exports = router;

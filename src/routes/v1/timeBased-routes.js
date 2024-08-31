const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../middlewares");
const multer = require("multer");
const { TimeBased } = require("../../controllers");

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get(
  "/getuser",
  authMiddleware.checkClientAuth,
  TimeBased.getBookingInfo
);
router.post(
  "/createBooking",
  authMiddleware.checkClientAuth,
  TimeBased.createNewBooking
);
router.post(
  "/updateBooking",
  authMiddleware.checkClientAuth,
  TimeBased.updateBooking
);

module.exports = router;

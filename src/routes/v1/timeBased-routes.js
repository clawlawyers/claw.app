const express = require("express");
const router = express.Router();

const multer = require("multer");
const { TimeBased } = require("../../controllers");

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/getuser", TimeBased.getBookingInfo);
router.post("/createBooking", TimeBased.createNewBooking);
router.post("/updateBooking", TimeBased.updateBooking);

module.exports = router;

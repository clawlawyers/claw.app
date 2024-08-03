const express = require("express");
const { CourtroomController } = require("../../controllers");
const { authMiddleware } = require("../../middlewares");
const multer = require("multer");
const TrailBooking = require("../../models/trailBookingAllow");

const router = express.Router();

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/book-courtroom", CourtroomController.bookCourtRoom);
router.post("/admin/book-courtroom", CourtroomController.adminBookCourtRoom);
router.post(
  "/book-courtroom-validation",
  CourtroomController.bookCourtRoomValidation
);
router.get("/book-courtroom", CourtroomController.getBookedData);
router.post("/login", CourtroomController.loginToCourtRoom);
router.post(
  "/getCourtroomUser",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.getUserDetails
); // use letter
router.post("/newcase", upload.single("file"), CourtroomController.newcase);
router.post("/edit_case", CourtroomController.edit_case);
router.post("/getCaseOverview", CourtroomController.getCaseOverview);
router.post("/user_arguemnt", CourtroomController.user_arguemnt);
router.post("/api/lawyer", CourtroomController.lawyer_arguemnt);
router.post("/api/judge", CourtroomController.judge_arguemnt);
router.post("/api/draft", CourtroomController.getDraft);
router.post("/api/change_states", CourtroomController.changeState);
router.post("/api/rest", CourtroomController.restCase);
router.post("/api/end", CourtroomController.endCase);
router.post(
  "/api/hallucination_questions",
  CourtroomController.hallucination_questions
);
router.post("/api/history", CourtroomController.CaseHistory);
router.post(
  "/api/downloadCaseHistory",
  CourtroomController.downloadCaseHistory
);
router.post(
  "/api/downloadSessionCaseHistory",
  CourtroomController.downloadSessionCaseHistory
);

router.post("/api/downloadFirtDraft", CourtroomController.downloadFirtDraft);
router.post("/api/download", CourtroomController.download);
router.get("/:user_id/getHistory", CourtroomController.getHistory);

// AddContactUsQuery Route

router.post("/add/ContactUsQuery", CourtroomController.AddContactUsQuery);

//

// API to insert data into TrailBooking
router.post("/api/trail-bookings", async (req, res) => {
  try {
    const {
      date,
      StartHour,
      EndHour,
      phoneNumber,
      email,
      totalSlots,
      bookedSlots,
    } = req.body;

    // Create a new booking document
    const newBooking = new TrailBooking({
      date,
      StartHour,
      EndHour,
      phoneNumber,
      email,
      totalSlots,
      bookedSlots,
    });

    // Save the booking to the database
    const savedBooking = await newBooking.save();
    res.status(201).json({
      message: "Trail booking created successfully",
      data: savedBooking,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error creating trail booking",
      error: err.message,
    });
  }
});

module.exports = router;

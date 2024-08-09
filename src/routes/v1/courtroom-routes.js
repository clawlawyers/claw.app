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
router.post("/admin/book-courtroom", CourtroomController.adminBookCourtRoom); // no use api
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
);
router.post(
  "/newcase",
  upload.fields([
    { name: "file" },
    { name: "file1" },
    { name: "file2" },
    { name: "file3" },
  ]),
  authMiddleware.checkCourtroomAuth,
  CourtroomController.newcase
);
router.post(
  "/edit_case",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.edit_case
);
router.post(
  "/getCaseOverview",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.getCaseOverview
);
router.post(
  "/user_arguemnt",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.user_arguemnt
);
router.post(
  "/api/lawyer",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.lawyer_arguemnt
);
router.post(
  "/api/judge",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.judge_arguemnt
);
router.post(
  "/api/draft",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.getDraft
);
router.post(
  "/api/change_states",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.changeState
);
router.post(
  "/api/rest",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.restCase
);
router.post(
  "/api/end",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.endCase
);
router.post(
  "/api/hallucination_questions",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.hallucination_questions
);
router.post(
  "/api/history",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.CaseHistory
);
router.post(
  "/api/downloadCaseHistory",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.downloadCaseHistory
);
router.post(
  "/api/downloadSessionCaseHistory",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.downloadSessionCaseHistory
);

router.post(
  "/api/downloadFirtDraft",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.downloadFirtDraft
);
router.post(
  "/api/download",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.download
);
router.get(
  "/getHistory",
  authMiddleware.checkCourtroomAuth,
  CourtroomController.getHistory
);

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

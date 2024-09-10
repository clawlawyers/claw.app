const express = require("express");
const router = express.Router();
const {
  getReferralCodes,
  getPlans,
  getUsers,
  getSubscribedUsers,
  getModels,
  getSessions,
  getMessages,
  getFeedbacks,
  getTopUsers,
  createCoupon,
  validateCoupon,
  deactivateCoupon,
  deleteCoupon,
  allCoupon,
  generateReferralCode,
  usertracking,
  userdailyvisit,
  usermonthlyvisit,
  useryearlyvisit,
  updateUserPlan,
  addFirstUser,
  createAdmin,
  getAdmins,
  removeAdminUser,
  isAdmin,
  removeUserPlan,
  getAllCourtRoomData,
  deleteBooking,
  updateUserDetails,
  updateUserTiming,
  allAllowedBooking,
  deleteAllowBooking,
  updateAllowedBooking,
  allowedLogin,
  deleteAllowedLogin,
  UpdateUserDetailsAllowedLogin,
  UpdateUserTimingAllowedLogin,
  updateClientCourtroomBooking,
  getClientCourtroomBookings,
  deleteClientCourtroomBookings,
  addNewAdmin,
  adminLogin,
  verifyAdminUser,
  getAllAdminNumbers,
  getTrialCoupon,
  createTrialCoupon,
  deleteTrialCoupon,
  userEveryDayData,
  userEveryMonthData,
  userEveryYearData,
} = require("../../controllers/admin-controller");
const { setLocation } = require("../../controllers/client-controller");
const {
  CourtroomController,
  SpecificLawyerCourtroomController,
} = require("../../controllers");
const TrailBooking = require("../../models/trailBookingAllow");
// const { updateUserPlan } = require("../../services/gpt-service");

router.get("/referralcode", getReferralCodes);
router.get("/plan", getPlans);
router.get("/user", getUsers);
router.get("/subscribed-user", getSubscribedUsers);
router.get("/model", getModels);
router.get("/session", getSessions);
router.get("/message", getMessages);
router.get("/feedback", getFeedbacks);
router.get("/topusers", getTopUsers);
router.post("/create", createCoupon);
router.post("/validate", validateCoupon);
router.post("/deactivate", deactivateCoupon);
router.delete("/delete", deleteCoupon);
router.get("/allcoupons", allCoupon);
router.patch("/generateReferralCode", generateReferralCode);
router.post("/usertrack", usertracking);
router.get("/dailyuserpagevisit", userdailyvisit);
router.get("/everyDayData", userEveryDayData);
router.get("/everyMonthData", userEveryMonthData);
router.get("/monthlyuserpagevisit", usermonthlyvisit);
router.get("/everyYearData", userEveryYearData);
router.get("/yearlyuserpagevisit", useryearlyvisit);
router.patch("/updateUserLocation", setLocation);
router.patch("/updateUserPlans", updateUserPlan);
router.post("/addFirstAdminUser", addFirstUser);
router.post("/:adminId/addAdminUser", createAdmin);
router.get("/getAdmins", getAdmins);
router.post("/:adminId/removeUser", removeAdminUser);
router.get("/:phoneNumber/isAdmin", isAdmin);
router.delete("/removeUserPlan", removeUserPlan);

// CourtRoom Admin routes

router.get("/allCourtRoomData", getAllCourtRoomData);
router.delete("/bookings/:bookingId/users/:userId", deleteBooking);
router.put("/update/users/:userId", updateUserDetails);
router.put("/bookings/:bookingId/users/:userId/slot", updateUserTiming);

// allow booking booking
// API to insert data into TrailBooking
router.post("/api/trail-bookings", async (req, res) => {
  try {
    const {
      StartDate,
      EndDate,
      StartHour,
      EndHour,
      phoneNumber,
      email,
      totalSlots,
    } = req.body;

    // Validate hour range
    if (StartHour < 0 || StartHour > 23 || EndHour < 0 || EndHour > 23) {
      return res
        .status(400)
        .json({ message: "Hours must be between 0 and 23." });
    }

    // Check if booking already exists
    const existingBooking = await TrailBooking.findOne({
      StartDate,
      EndDate,
      StartHour: { $lte: EndHour },
      EndHour: { $gte: StartHour },
      $or: [{ phoneNumber }, { email }],
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "Booking already exists for the provided date and time.",
      });
    }

    // Create and save new booking
    const newBooking = new TrailBooking({
      StartDate,
      EndDate,
      StartHour,
      EndHour,
      phoneNumber,
      email,
      totalSlots,
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

router.get("/allAllowedBooking", allAllowedBooking);
router.delete("/AllowedBooking/:id", deleteAllowBooking);
router.patch("/AllowedBooking/:id", updateAllowedBooking);

// allow login
router.post("/admin/book-courtroom", CourtroomController.adminBookCourtRoom);
router.get("/getAllallowedLogin", allowedLogin);
router.delete("/allowedLogin/:bookingId/users/:userId", deleteAllowedLogin);
router.put("/allowedLogin/users/:userId", UpdateUserDetailsAllowedLogin);
router.put(
  "/allowedLogin/:bookingId/users/:userId/slot",
  UpdateUserTimingAllowedLogin
);

// Client-courtroom

router.post(
  "/client/book-courtroom",
  SpecificLawyerCourtroomController.bookCourtRoom
);
router.patch("/client/book-courtroom", updateClientCourtroomBooking);
router.get("/client/book-courtroom", getClientCourtroomBookings);
router.delete("/client/book-courtroom", deleteClientCourtroomBookings);

// admin login

router.post("/add-new-admin", addNewAdmin);
router.post("/login", adminLogin);
router.post("/verify", verifyAdminUser);
router.get("/getAllUsers", getAllAdminNumbers);

// trial courtroom coupon routes

router.get("/trial-coupon", getTrialCoupon);
router.post("/trial-coupon", createTrialCoupon);
router.delete("/trial-coupon", deleteTrialCoupon);

module.exports = router;

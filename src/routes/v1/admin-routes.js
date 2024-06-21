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
} = require("../../controllers/admin-controller");

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

module.exports = router;

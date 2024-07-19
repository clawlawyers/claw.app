const express = require("express");
const { CourtroomController } = require("../../controllers");
const { authMiddleware } = require("../../middlewares");

const router = express.Router();

router.post("/book-courtroom", CourtroomController.bookCourtRoom);
router.get("/book-courtroom", CourtroomController.getBookedData);
router.post("/login", CourtroomController.loginToCourtRoom);
router.post("/verify", authMiddleware.checkCourtroomAuth);

module.exports = router;

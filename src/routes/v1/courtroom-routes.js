const express = require("express");
const { CourtroomController } = require("../../controllers");

const router = express.Router();

router.post("/book-courtroom", CourtroomController.bookCourtRoom);
router.get("/book-courtroom", CourtroomController.getBookedData);

module.exports = router;

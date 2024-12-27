const express = require("express");
const { ChatBotController } = require("../../controllers");
const router = express.Router();

router.get("/getUserId", ChatBotController.getUserId);

router.post("/generateResponse", ChatBotController.sendMessage);

router.post("/contact-us", ChatBotController.getContactUse);

router.post("/end-session", ChatBotController.getEndSession);

module.exports = router;

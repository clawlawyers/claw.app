const express = require("express");
const { ClientAdiraController } = require("../../controllers");
const { checkClientAdiraAuth } = require("../../middlewares/auth-middleware");
const router = express.Router();

router.post(
  "/clientAdiraValidation",
  checkClientAdiraAuth,
  ClientAdiraController.getMobileNumber
);

router.get("/getuser", checkClientAdiraAuth, ClientAdiraController.getUser);

module.exports = router;

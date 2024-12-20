const { ClientController } = require("../../controllers");
const express = require("express");
const {
  validateRequestMiddleware,
  authMiddleware,
} = require("../../middlewares");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const passport = require("passport");

const upload = multer({
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
      return callback(new Error("Only images are allowed"));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024,
  },
});

router.post(
  "/signup",
  validateRequestMiddleware.validateSignUpRequest,
  ClientController.createClient
);
router.post(
  "/login",
  validateRequestMiddleware.validateLoginRequest,
  ClientController.signin
);
router.post(
  "/register",
  validateRequestMiddleware.validateClientRegisterRequest,
  ClientController.register
);

router.get("/auth/me", authMiddleware.checkClientAuth, ClientController.authMe);
router.post(
  "/update/bankdetails",
  authMiddleware.checkClientAuth,
  authMiddleware.checkAmabassador,
  ClientController.updateClient
);
router.post(
  "/leaders",
  authMiddleware.checkClientAuth,
  ClientController.createLeader
);
router.get("/list", ClientController.getAllClients);

router.post(
  "/verify",
  validateRequestMiddleware.validateClientVerifyRequest,
  ClientController.verify
);

// google auth

// Authentication routes
// router.get(
//   "/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//     session: false,
//   })
// );

router.post("/google/callback", ClientController.googleAuthCallback);

// router.post(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "https://smart-shop-kro.netlify.app/",
//     session: false,
//   }),
//   ClientController.googleAuthCallbackTemp
// );

router.post(
  "/verifyCleint",
  validateRequestMiddleware.verifyClientMiddleware,
  ClientController.verify
);
router.post("/setState", ClientController.setLocation);
router.patch(
  "/",
  upload.single("profilePicture"),
  validateRequestMiddleware.validateClientUpdateRequest,
  authMiddleware.checkClientAuth,
  ClientController.updateClient
);

router.post("/validate-user", ClientController.validateUser);

module.exports = router;

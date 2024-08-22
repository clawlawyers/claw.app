const express = require("express");
const { SpecificLawyerCourtroomController } = require("../../controllers");
const { authMiddleware } = require("../../middlewares");
const multer = require("multer");

const router = express.Router();

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/book-courtroom", SpecificLawyerCourtroomController.bookCourtRoom);

// router.post(
//   "/book-courtroom-validation",
//   SpecificLawyerCourtroomController.bookCourtRoomValidation
// );

// router.get("/book-courtroom", SpecificLawyerCourtroomController.getBookedData);

router.post("/login", SpecificLawyerCourtroomController.loginToCourtRoom);

router.post(
  "/getCourtroomUser",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.getUserDetails
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
  SpecificLawyerCourtroomController.newcase
);

router.post(
  "/edit_case",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.edit_case
);
router.post(
  "/getCaseOverview",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.getCaseOverview
);
router.post(
  "/user_arguemnt",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.user_arguemnt
);
router.post(
  "/api/lawyer",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.lawyer_arguemnt
);
router.post(
  "/api/judge",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.judge_arguemnt
);
router.post(
  "/api/draft",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.getDraft
);
router.post(
  "/api/change_states",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.changeState
);
router.post(
  "/api/rest",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.restCase
);
router.post(
  "/api/end",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.endCase
);
router.post(
  "/api/hallucination_questions",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.hallucination_questions
);
router.post(
  "/api/history",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.CaseHistory
);
router.post(
  "/api/downloadCaseHistory",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.downloadCaseHistory
);
router.post(
  "/api/downloadSessionCaseHistory",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.downloadSessionCaseHistory
);

router.post(
  "/api/getSessionCaseHistory",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.getSessionCaseHistory
);

router.post(
  "/api/downloadFirtDraft",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.downloadFirtDraft
);
router.post(
  "/api/download",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.download
);
router.get(
  "/getHistory",
  authMiddleware.checkCourtroomAuth,
  SpecificLawyerCourtroomController.getHistory
);

// AddContactUsQuery Route

router.post(
  "/add/ContactUsQuery",
  SpecificLawyerCourtroomController.AddContactUsQuery
);

module.exports = router;

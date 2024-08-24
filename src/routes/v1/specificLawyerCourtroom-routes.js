const express = require("express");
const { SpecificLawyerCourtroomController } = require("../../controllers");
const { authMiddleware } = require("../../middlewares");
const multer = require("multer");

const router = express.Router();

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/book-courtroom", SpecificLawyerCourtroomController.bookCourtRoom);

router.post(
  "/book-courtroom-validation",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.bookCourtRoomValidation
);

// router.get("/book-courtroom", SpecificLawyerCourtroomController.getBookedData);

router.post("/login", SpecificLawyerCourtroomController.loginToCourtRoom);

router.post(
  "/getCourtroomUser",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
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
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.newcase
);

router.post(
  "/edit_case",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.edit_case
);
router.post(
  "/getCaseOverview",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.getCaseOverview
);
router.post(
  "/user_arguemnt",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.user_arguemnt
);
router.post(
  "/api/lawyer",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.lawyer_arguemnt
);
router.post(
  "/api/judge",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.judge_arguemnt
);
router.post(
  "/api/draft",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.getDraft
);
router.post(
  "/api/change_states",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.changeState
);
router.post(
  "/api/rest",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.restCase
);
router.post(
  "/api/end",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.endCase
);
router.post(
  "/api/hallucination_questions",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.hallucination_questions
);
router.post(
  "/api/history",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.CaseHistory
);
router.post(
  "/api/downloadCaseHistory",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.downloadCaseHistory
);
router.post(
  "/api/downloadSessionCaseHistory",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.downloadSessionCaseHistory
);

router.post(
  "/api/getSessionCaseHistory",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.getSessionCaseHistory
);

router.post(
  "/api/downloadFirtDraft",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.downloadFirtDraft
);
router.post(
  "/api/download",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.download
);
router.get(
  "/getHistory",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.getHistory
);

// AddContactUsQuery Route

router.post(
  "/add/ContactUsQuery",
  SpecificLawyerCourtroomController.AddContactUsQuery
);

//time storing

router.post(
  "/api/storeTime",
  authMiddleware.checkSpecificLawyerCourtroomAuth,
  SpecificLawyerCourtroomController.storeTime
);

module.exports = router;

const express = require("express");
const { GptController } = require("../../controllers/index");
const { authMiddleware } = require("../../middlewares");
const router = express.Router();
const multer = require("multer");

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// routes to manage models for prompt generation
// router.get('/model/:modelId');
// router.get('/models');

// router.post('/model');

// router.delete('/model')

// routes to create/manage sessions
router.use(authMiddleware.checkClientAuth);
router.get("/user", GptController.fetchGptUser);
router.post("/case/related/:sessionId", GptController.getRelatedCases);
router.get("/case/:folderId/:caseId", GptController.fetchCaseDetails);
router.post("/case/summeryDetails", GptController.getSummaryDetails);
router.post(
  "/case/legalgptSummeryDetails",
  GptController.getLegalgptSummaryDetails
);
router.post("/case/search", GptController.queryCase);
router.get(
  "/session/:sessionId/:currencyType",
  GptController.getSessionMessages
);
router.get("/sessions/:model/:currencyType", GptController.getUserSessions);
router.delete("/sessions/:model", GptController.deleteUserSessions);
router.post("/user", GptController.initGptUser);

router.post("/createModel", GptController.createGptModel);
router.post("/createPlan", GptController.createGptPlan);

router.get(
  "/referralCode",
  authMiddleware.checkAmabassador,
  GptController.fetchAmbassadorDetails
);

router.post("/referralCode/generate", GptController.createReferralCode);
router.post("/referralCode/redeem", GptController.redeemReferralCode);
router.post("/verifyReferralCode", GptController.verifyReferralCode);

// router.post('/conversation', GptController.generateGptResponse);
router.post("/session", GptController.startSession);
router.post("/session/prompt", GptController.appendMessage);
router.post("/session/appendMessage", GptController.appendMessageByScocket);
router.post("/session/judgement", GptController.judgement);
router.post("/session/relevantAct", GptController.relevantAct);

router.post("/suggested-questions", GptController.suggestQuestions);

router.post("/regenerate-response", GptController.appendRegeneratedMessage);

router.post("/feedback", GptController.feedBack);

router.post("/cancelSubscription", GptController.cancelSubscription);

router.post("/api/read_aloud", GptController.readAloud);

router.post("/getPurchaseHistory", GptController.getPurchaseHistory);

router.post(
  "/upload",
  upload.fields([
    { name: "file" },
    { name: "file1" },
    { name: "file2" },
    { name: "file3" },
  ]),
  GptController.upload
);

router.post("/translate", GptController.translate);

//for genrating invoice pdf
router.post("/generate-invoice", GptController.generateInvoice);

// router.post("/dummy", GptController.caseSearchOn);
// router.post("/dummyCheckbox", GptController.caseSearchOnCheck);
// router.post("/funny", GptController.funPlan);

// router.delete('/session/sessionId');

router.post("/storeUsedTime", GptController.storeUsedTime);

router.patch("/updateCurrency", GptController.updateCurrency);

module.exports = router;

const express = require("express");
const { GptController } = require("../../controllers/index");
const { authMiddleware } = require("../../middlewares");
const router = express.Router();

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
router.get("/session/:sessionId", GptController.getSessionMessages);
router.get("/sessions/:model", GptController.getUserSessions);
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

// router.post('/conversation', GptController.generateGptResponse);
router.post("/session", GptController.startSession);
router.post("/session/prompt", GptController.appendMessage);
router.post("/session/judgement", GptController.judgement);
router.post("/session/relevantAct", GptController.relevantAct);

// router.post("/dummy", GptController.caseSearchOn);
// router.post("/dummyCheckbox", GptController.caseSearchOnCheck);
// router.post("/funny", GptController.funPlan);

// router.delete('/session/sessionId');

module.exports = router;

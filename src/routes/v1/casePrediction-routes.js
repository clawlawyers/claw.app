const express = require("express");
const { CasePredictionController } = require("../../controllers");
const multer = require("multer");
const router = express.Router();

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/user_id", CasePredictionController.createUserId);

router.post("/api/case_details", CasePredictionController.caseDetails);

router.post("/api/evidence_details", CasePredictionController.evidenceDetails);

router.post(
  "/api/case_document",
  upload.single("file"),
  CasePredictionController.caseDocument
);

router.post(
  "/api/evidence_document",
  CasePredictionController.evidenceDocument
);

router.post("/api/witness_details", CasePredictionController.witnessDetails);

router.post(
  "/api/evidence_analysis",
  CasePredictionController.evidenceAnalysis
);

router.post(
  "/api/procedural_compliance",
  CasePredictionController.proceduralCompliance
);

router.post("/api/legal_factors", CasePredictionController.legalFactors);

router.post("/api/cost", CasePredictionController.cost);

router.post("/api/recommendation", CasePredictionController.recommendation);

router.post("/api/db_generate", CasePredictionController.dbGenerate);

router.post("/api/ask_query", CasePredictionController.askQuery);

router.post("/api/win_probability", CasePredictionController.winProbability);

router.post("/api/overall_score", CasePredictionController.OverallScore);

router.post("/api/end", CasePredictionController.EndSession);

module.exports = router;

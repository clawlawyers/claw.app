const express = require("express");
const router = express.Router();

const multer = require("multer");
const { AiDrafter } = require("../../controllers");

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/upload_document",
  upload.single("file"),
  AiDrafter.uploadDocument
);

router.get("/create_document", AiDrafter.createDocument);
router.post("/get_document_from_prompt", AiDrafter.getDocumentFromPrompt);
router.post("/upload_prerequisites", AiDrafter.uploadPrerequisites);
router.post("/upload_optional_parameters", AiDrafter.uploadOptionalParameters);
router.post("/get_requirements", AiDrafter.getRequirements);
router.post("/generate_document", AiDrafter.generateDocument);
router.post("/breakout", AiDrafter.breakout);
router.post("/ask_question", AiDrafter.askQuestion);
router.post("/summarize", AiDrafter.summarize);
router.post("/edit_document", AiDrafter.editDocument);

module.exports = router;
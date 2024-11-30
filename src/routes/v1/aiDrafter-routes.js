const express = require("express");
const router = express.Router();

const multer = require("multer");
const { AiDrafter } = require("../../controllers");
const { authMiddleware } = require("../../middlewares");

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// router.use(authMiddleware.checkClientAuth);

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
router.post(
  "/get_document_prompt_requirements",
  AiDrafter.getDocumentPromptRequirements
); // this only for get from prompt

router.post("/generate_document_for_type", AiDrafter.generateDocumentForType);
router.post("/breakout", AiDrafter.breakout);
router.post("/generate_db", AiDrafter.generateDatabase);
router.post("/ask_question", AiDrafter.askQuestion);
router.post("/summarize", AiDrafter.summarize);
router.post("/edit_document", AiDrafter.editDocument);
router.post("/summary_headings", AiDrafter.summaryHeadings);
router.post("/favor", AiDrafter.favor);
router.post("/neutralize", AiDrafter.neutralize);
router.post("/counter_favor", AiDrafter.counterFavor);
router.post("/api/get_types", AiDrafter.apiGetTypes);
router.post("/api_add_clause", AiDrafter.apiAddClause);
router.post("/api/get_modified_doc", AiDrafter.apiGetModifiedDoc);
router.post("/api/get_pdf", AiDrafter.getpdf);
router.post("/api/get_pdf_count", AiDrafter.getpdfpagecount);
router.post(
  "/upload_input_document",
  upload.fields([
    { name: "file" },
    { name: "file1" },
    { name: "file2" },
    { name: "file3" },
  ]),
  AiDrafter.AiDrafterUploadInputDocument
);

// Adira Admin routes

// router.get("/addAdmin")
router.post("/addAdmin", AiDrafter.AddAdiraAdmin);
// router.put("/updateAdmin")
// router.delete("/deleteAdmin")

// Define the route for file upload
router.post("/uploadPrompt", upload.single("file"), AiDrafter.handleFileUpload);

router.post("/anomaly_questions", AiDrafter.AnomalyQuestions);

router.post("/api/telegram_bot", AiDrafter.TelegramBot);

router.post("/recommend_question", AiDrafter.RecommendQuestion);

// create a adira plan

router.post("/create_adira_plan", AiDrafter.createAdiraPlan);

router.get(
  "/retrive-adira_plan",
  authMiddleware.checkClientAuth,
  AiDrafter.retriveAdiraPlan
);

module.exports = router;

const express = require("express");
const { SuccessResponse, ErrorResponse } = require("../../utils/common");
const AppError = require("../../utils/errors/app-error");
const { getNews } = require("../../services/news-service");
// const { ClientController, UserController } = require('../../controllers');
const router = express.Router();

const multer = require("multer");
const uploadToCloudinary = require("../../utils/coutroom/fileUpload");
const { StatusCodes } = require("http-status-codes");

router.post("/news", async (req, res) => {
  try {
    const response = await getNews(parseInt(req.body.type));
    const successResponse = SuccessResponse(response);
    res.status(200).json(successResponse);
  } catch (error) {
    res.status(error.statusCode || 500).json(ErrorResponse({}, error));
  }
});

// Set up Multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log(req.file);
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const publicUrl = await uploadToCloudinary(file.buffer);
    return res.status(StatusCodes.OK).json(SuccessResponse({ url: publicUrl }));
  } catch (error) {
    const errorResponse = ErrorResponse({}, error);
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(errorResponse);
  }
});

module.exports = router;

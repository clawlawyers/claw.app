// server.js
const express = require("express");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const { checkClientAdiraAuth } = require("../../middlewares/auth-middleware");
const router = express.Router();

let storage;
if (process.env.NODE_ENV !== "production") {
  // Google Cloud Storage configuration
  storage = new Storage({
    keyFilename: path.join(
      __dirname + "/voltaic-charter-435107-j5-d041d0de66bf.json"
    ), // Replace with your service account key file path
  });
} else {
  // Google Cloud Storage configuration
  storage = new Storage({
    keyFilename: path.join(
      "/etc/secrets/voltaic-charter-435107-j5-d041d0de66bf.json"
    ), // Replace with your service account key file path
  });
}

console.log(
  path.join(__dirname + "/voltaic-charter-435107-j5-d041d0de66bf.json")
);
console.log("/etc/secrets/voltaic-charter-435107-j5-d041d0de66bf.json");

const bucketName = "test_rajkiron"; // Replace with your bucket name
const bucket = storage.bucket(bucketName);

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory before uploading to GCS
});

// Middleware to simulate authentication (replace with real auth middleware)
const authenticateUser = (req, res, next) => {
  req.user = {
    id: "user_1", // Replace this with actual user ID from your auth system
  };
  next();
};

router.post(
  "/uploadFileWithExpiration",
  authenticateUser,
  upload.single("file"),
  async (req, res) => {
    const userId = req.user.id;
    const file = req.file;
    const expirationInDays = 30; // Set the expiration time for 30 days (example)

    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    // File path in the bucket: userId/filename
    const filePath = `${userId}/${file.originalname}`;

    try {
      const blob = bucket.file(filePath);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
      });

      blobStream.on("error", (err) => {
        return res.status(500).send({ message: err.message });
      });

      blobStream.on("finish", async () => {
        // After file upload, set the expiration time
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + expirationInDays);

        await blob.setMetadata({
          metadata: {
            customTime: expirationDate.toISOString(), // Custom expiration time in ISO format
          },
        });

        res
          .status(200)
          .send({
            message: "File uploaded and expiration time set successfully!",
          });
      });

      blobStream.end(file.buffer);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }
);

// Route to upload a file to the user's folder
router.post(
  "/uploadFile",
  checkClientAdiraAuth,
  upload.single("file"),
  async (req, res) => {
    const userId = req.user._id.toString();
    const file = req.file;

    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    // File path in the bucket: userId/filename
    const filePath = `${userId}/${file.originalname}`;

    try {
      const blob = bucket.file(filePath);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
      });

      blobStream.on("error", (err) => {
        return res.status(500).send({ message: err.message });
      });

      blobStream.on("finish", () => {
        res.status(200).send({ message: "File uploaded successfully!" });
      });

      blobStream.end(file.buffer);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }
);

// Route to list all files in the user's folder
router.get("/listFiles", checkClientAdiraAuth, async (req, res) => {
  const userId = req.user._id.toString();

  try {
    const [files] = await bucket.getFiles({
      prefix: `${userId}/`,
    });

    const fileList = files.map((file) => ({
      name: file.name,
      url: `https://storage.googleapis.com/${bucketName}/${file.name}`,
    }));

    res.status(200).send(fileList);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Route to download a file from the user's folder
router.get(
  "/downloadFile/:filename",
  checkClientAdiraAuth,
  async (req, res) => {
    const userId = req.user._id.toString();
    const { filename } = req.params;

    const filePath = `${userId}/${filename}`;
    const file = bucket.file(filePath);

    try {
      const [exists] = await file.exists();
      if (!exists) {
        return res.status(404).send("File not found.");
      }

      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      file.createReadStream().pipe(res);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }
);

// Route to delete a file from the user's folder
router.delete(
  "/deleteFile/:filename",
  checkClientAdiraAuth,
  async (req, res) => {
    const userId = req.user._id.toString();
    const { filename } = req.params;

    const filePath = `${userId}/${filename}`;
    const file = bucket.file(filePath);

    try {
      await file.delete();
      res.status(200).send({ message: "File deleted successfully!" });
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }
);

// Route to create a new folder in the user's directory
router.post(
  "/createFolder/:folderName",
  checkClientAdiraAuth,
  async (req, res) => {
    const userId = req.user._id.toString();
    const { folderName } = req.params;

    // Create a "dummy" file to create a folder in GCS
    const folderPath = `${userId}/${folderName}`;
    const file = bucket.file(folderPath);

    try {
      await file.save("");
      res.status(200).send({ message: "Folder created successfully!" });
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }
);

// Route to rename a file in the user's folder
router.post("/renameFile", checkClientAdiraAuth, async (req, res) => {
  const { oldFilename, newFilename } = req.body;
  const userId = req.user._id.toString();

  const oldFilePath = `${userId}/${oldFilename}`;
  const newFilePath = `${userId}/${newFilename}`;
  const oldFile = bucket.file(oldFilePath);
  const newFile = bucket.file(newFilePath);

  try {
    // Check if the original file exists
    const [exists] = await oldFile.exists();
    if (!exists) {
      return res.status(404).send("Original file not found.");
    }

    // Copy the original file to the new location (new name)
    await oldFile.copy(newFile);

    // Delete the original file
    await oldFile.delete();

    res.status(200).send({ message: "File renamed successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Route to rename a folder in the user's directory
router.post("/renameFolder", checkClientAdiraAuth, async (req, res) => {
  const { oldFolderName, newFolderName } = req.body;
  const userId = req.user._id.toString();

  const oldFolderPath = `${userId}/${oldFolderName}/`;
  const newFolderPath = `${userId}/${newFolderName}/`;

  try {
    // List all files in the old folder
    const [files] = await bucket.getFiles({
      prefix: oldFolderPath,
    });

    if (files.length === 0) {
      return res.status(404).send("Old folder not found or empty.");
    }

    // Copy each file to the new folder and delete the original
    await Promise.all(
      files.map(async (file) => {
        const oldFilePath = file.name;
        const newFilePath = oldFilePath.replace(oldFolderPath, newFolderPath);

        // Copy file to new folder
        await file.copy(newFilePath);

        // Delete the original file from the old folder
        await file.delete();
      })
    );

    res.status(200).send({ message: "Folder renamed successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;

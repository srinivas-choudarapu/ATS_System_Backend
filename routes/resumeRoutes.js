const express = require("express");
const multer = require("multer");
const { uploadToS3 } = require("../services/uploadService");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await uploadToS3(req.file);

    // console.log(result.fileUrl);

    res.json({
      message: "Upload successful",
      url: result.fileUrl,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const express = require("express");
const multer = require("multer");
const { uploadToS3 } = require("../services/uploadService");
const supabase = require("../config/supabaseClient");
const router = express.Router();
const uploadResume = require("../controllers/resumeController").uploadResume;
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload",
  upload.single("resume"),
  uploadResume
);

router.get("/test", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Error:", error.message);
    } else {
      console.log("✅ Supabase connected successfully");
      console.log("Data:", data);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
});

module.exports = router;
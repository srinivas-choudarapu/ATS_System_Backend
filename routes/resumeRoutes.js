const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const authMiddleware = require("../middleware/authMiddleware");
const { 
  uploadResume, 
  getResumeHistory, 
  getResumeById, 
  deleteResume, 
  deleteAllResumes
} = require("../controllers/resumeController");

//upload resume and run analysis
router.post(
  "/upload",
  upload.single("resume"),
  uploadResume
);

//get resume history for logged in user
router.get(
  "/history", 
  authMiddleware, 
  getResumeHistory
);

//get specific resume and analysis by ID (only if belongs to user)
router.get("/:id", 
  authMiddleware, 
  getResumeById
);

//delete specific resume (only if belongs to user)
router.delete(
  "/:id",
  authMiddleware,
  deleteResume
);

//dlete all resumes for a user
router.delete(
  "/all",
  authMiddleware,
  deleteAllResumes
);

module.exports = router;
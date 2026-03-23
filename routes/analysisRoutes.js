const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  runAnalysis,
  getAnalysisById,
  deleteAnalysis,
  deleteAnalysisByResumeId,
  getAnalysisByResumeId,
  getJDByAnalysisId,
  getAllJDByResumeId
} = require("../controllers/analysisController");


// run new analysis on existing resume
router.post(
    "/run", 
    authMiddleware, 
    runAnalysis
);

// get analysis result
router.get(
    "/:id", 
    authMiddleware, 
    getAnalysisById
);

//delete analysis by id
router.delete(
  "/:id",
  authMiddleware,
  deleteAnalysis
);

//delete all analysis results for a resume
router.delete(
  "/resume/:resumeId",
  authMiddleware,
  deleteAnalysisByResumeId
);

// Get all analysis results for a resume
// GET /analysis/resume/:resumeId
router.get(
    "/resume/:resumeId",
    authMiddleware,
    getAnalysisByResumeId
);

//get JD data by analysis ID
// GET /analysis/:id/jd
router.get(
  "/:id/jd",
  authMiddleware,
  getJDByAnalysisId
);

// Get all JD data for a resume
// GET /analysis/resume/:resumeId/jd
router.get(
  "/resume/:resumeId/jd",
  authMiddleware,
  getAllJDByResumeId
);

module.exports = router;
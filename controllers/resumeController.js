const extractTextFromPDF = require("../utils/extractText");
const { parseResume, parseJD } = require("../services/parseService");
const runATSAnalysis = require("../services/atsEngineService");

const { uploadToS3, deleteFromS3, getKeyFromUrl } = require("../services/uploadService");
const checkResumeLimit = require("../services/resumeLimitService");

const supabase = require("../config/supabaseClient");

const uploadResume = async (req, res) => {
  try {
    const file = req.file;
    const { jdText } = req.body;

    if (!file || !jdText) {
      return res.status(400).json({ error: "Resume and JD required" });
    }

    // 1. Upload to S3
    const { fileUrl,fileKey } = await uploadToS3(file);

    // 2. Extract text
    const text = await extractTextFromPDF(fileUrl);

    // 3. Parse
    const resumeData = parseResume(text);
    const jdData = parseJD(jdText);
    resumeData.text=text; // for keyword analysis
    jdData.text=jdText; // for keyword analysis

    // 4. Run ATS Engine
    const analysisResult = runATSAnalysis(resumeData, jdData);

    // 5. Check if user logged in
    const user = req.user; // only exists if middleware used elsewhere

   
    //CASE 1: LOGGED IN USER

    if (user) {
      const limitCheck = await checkResumeLimit(user.id);

      if (!limitCheck.allowed) {
        return res.status(400).json({
          error: limitCheck.message
        });
      }

      // store resume
      const { data: resume } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          file_url: fileUrl,
          parsed_text: text
        })
        .select()
        .single();

      // store analysis
      await supabase.from("analysis").insert({
        resume_id: resume.id,
        jd_text: jdText,
        score: analysisResult.score,
        skill_score: analysisResult.skillScore,
        experience_score: analysisResult.experienceScore,
        project_score: analysisResult.projectScore,
        missing_skills: analysisResult.missingSkills,
        suggestions: analysisResult.suggestions
      });

      return res.json({
        message: "Stored successfully",
        analysis: analysisResult
      });
    }


    //CASE 2: NOT LOGGED IN
    // const key=getKeyFromUrl(fileUrl); // getKeyFromUrl(fileUrl);
    // console.log("fileKey:", fileKey);
    // console.log("key from URL:", key);

    // delete from S3 (temporary use only)
    const  key  = getKeyFromUrl(fileUrl);
    await deleteFromS3(key);

    return res.json({
      message: "Analysis done (not saved)",
      analysis: analysisResult
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
};

module.exports = {
  uploadResume
};
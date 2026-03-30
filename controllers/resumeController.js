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
    // const user = req.user; // only exists if middleware used elsewhere

    let user = null;

const token = req.cookies?.access_token;

if (token) {
  const { data, error } = await supabase.auth.getUser(token);

  if (!error && data.user) {
    user = data.user;
  }
}

   
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
      const { data: analysis } = await supabase.from("analysis").insert({
        resume_id: resume.id,
        jd_text: jdText,
        score: analysisResult.score,
        skill_score: analysisResult.skillScore,
        experience_score: analysisResult.experienceScore,
        education_score: analysisResult.educationScore,
        keyword_score: analysisResult.keywordsScore,
        project_score: analysisResult.projectScore,
        missing_skills: analysisResult.missingSkills,
        suggestions: analysisResult.suggestions
      })
      .select().single();

      // store JD
      await supabase.from("jd_parsed").insert({
        analysis_id: analysis.id, 
        required_skills: jdData.requiredSkills,
        optional_skills: jdData.optionalSkills,
        required_experience: jdData.requiredExperience,
        education_required: jdData.educationRequired
      });

      await supabase.from("resume_metadata").insert({
        resume_id: resume.id,
        skills: resumeData.skills,
        experience: resumeData.experience,
        education: resumeData.education,
        projects: resumeData.projects
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



//get all resumes for a user
const getResumeHistory = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
};


//get resume by id
const getResumeById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Resume not found" });
    }

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching resume" });
  }
};

//delete resume by id
const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: resume, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // delete from S3
    const key = getKeyFromUrl(resume.file_url);
    await deleteFromS3(key);

    // delete from DB
    await supabase.from("resumes").delete().eq("id", id);

    res.json({ message: "Deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Delete failed" });
  }
};

//delete all resumes for a user
const deleteAllResumes = async (req, res) => {
  try {
    const userId = req.user.id;
    

    // 1️⃣ Get all resumes of user
    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;

    // 2️⃣ Delete all files from S3
    for (const resume of resumes) {
      try {
        const key = getKeyFromUrl(resume.file_url);
        await deleteFromS3(key);
      } catch (err) {
        console.error("S3 delete error:", err);
      }
    }

    // 3️⃣ Delete all from DB
    await supabase
      .from("resumes")
      .delete()
      .eq("user_id", userId);

    res.json({ message: "All resumes deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete all resumes" });
  }
};
module.exports = {
  uploadResume,
  getResumeHistory,
  getResumeById,
  deleteResume,
  deleteAllResumes
};
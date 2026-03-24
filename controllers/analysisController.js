const supabase = require("../config/supabaseClient");
const { parseResume, parseJD } = require("../services/parseService");
const runATSAnalysis = require("../services/atsEngineService");
const { urlencoded } = require("express");
urlencoded({ extended: true });


//  Run analysis for existing resume
const runAnalysis = async (req, res) => {
  try {
    const { resumeId, jdText } = req.body;

    if (!resumeId || !jdText) {
      return res.status(400).json({
        error: "resumeId and jdText are required"
      });
    }

    //  Get resume from DB
    const { data: resume, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      // .eq("user_id", req.user.id)
      .single();

    if (error || !resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    //Parse
    const resumeData = parseResume(resume.parsed_text);
    const jdData = parseJD(jdText);
    resumeData.text=resume.parsed_text; // for keyword analysis
    jdData.text=jdText; // for keyword analysis
    //  Run ATS engine
    const result = runATSAnalysis(resumeData, jdData);

    //  Store new analysis (DO NOT overwrite)
    const { data: analysis } = await supabase
      .from("analysis")
      .insert({
        resume_id: resumeId,
        jd_text: jdText,
        score: result.score,
        skill_score: result.skillScore,
        experience_score: result.experienceScore,
        education_score: result.educationScore,
        keyword_score: result.keywordsScore,
        project_score: result.projectScore,
        missing_skills: result.missingSkills,
        suggestions: result.suggestions
      })
      .select()
      .single();

    return res.json({
      message: "Analysis completed",
      analysis
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Analysis failed" });
  }
};


// Get analysis by ID
const getAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("analysis")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch analysis" });
  }
};

//delete analysis by id
const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("analysis")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.json({ message: "Analysis deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Delete failed" });
  }
};

//delete all analysis results for a resume
const deleteAnalysisByResumeId = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const { data, error } = await supabase
      .from("analysis")
      .delete()
      .eq("resume_id", resumeId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "All analysis for the resume deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Delete failed" });
  }
};

//get all analysis results for a resume
const getAnalysisByResumeId = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const { data, error } = await supabase
      .from("analysis")
      .select("*")
      .eq("resume_id", resumeId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch analysis list" });
  }
};

//get JD data by analysis ID
const getJDByAnalysisId = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("analysis")
      .select(`
        id,
        jd_text,
        jd_parsed (
          required_skills,
          optional_skills,
          required_experience,
          education_required
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch JD" });
  }
};

//get all JD data for a resume
const getAllJDByResumeId = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const { data, error } = await supabase
      .from("analysis")
      .select(`
        id,
        jd_text,
        created_at,
        jd_parsed (
          required_skills,
          optional_skills,
          required_experience,
          education_required
        )
      `)
        .eq("resume_id", resumeId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch JD list" });
  }
};

module.exports = {
  runAnalysis,
  getAnalysisById,
  deleteAnalysis,
  deleteAnalysisByResumeId,
  getAnalysisByResumeId,
  getJDByAnalysisId,
  getAllJDByResumeId
};
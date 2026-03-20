const path = require("path");
const supabase = require("../config/supabaseClient");

// Always load .env from backend root regardless of current working directory.
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const MAX_RESUMES = (process.env.MAX_RESUMES);
console.log("Max resumes allowed:", MAX_RESUMES);

const checkResumeLimit = async (userId) => {
  try {
    const { data: resumes, error } = await supabase
      .from("resumes")
      .select("id")
      .eq("user_id", userId);

    if (error) throw error;

    const count = resumes.length;

    if (count >= MAX_RESUMES) {
      return {
        allowed: false,
        message: `You have reached the maximum limit of ${MAX_RESUMES} resumes. Please delete one to upload a new resume.`,
        count
      };
    }

    return {
      allowed: true,
      message: `You can upload resume ( ${MAX_RESUMES} )`,
      count
    };

  } catch (error) {
    console.error("Resume limit check error:", error);
    throw new Error("Failed to check resume limit");
  }
};

module.exports = checkResumeLimit;
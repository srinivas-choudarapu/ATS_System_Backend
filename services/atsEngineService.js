const {
  calculateSkillScore,
  calculateExperienceScore,
  calculateProjectScore,
  findMissingSkills,
  calculateEducationScore,
  calculateKeywordsScore
} = require("../utils/scoringUtils");

const runATSAnalysis = (resumeData, jdData) => {

  // individual scores
  const skillScore = calculateSkillScore(
    resumeData.skills,
    jdData.requiredSkills
  );

  const experienceScore = calculateExperienceScore(
    resumeData.experience,
    jdData.requiredExperience
  );

  const projectScore = calculateProjectScore(
    resumeData.projects,
    jdData.requiredSkills
  );

    const educationScore = calculateEducationScore(
    resumeData.education,
    jdData.requiredEducation
  );

  const missingSkills = findMissingSkills(
    resumeData.skills,
    jdData.requiredSkills
  );
    const keywordsScore = calculateKeywordsScore(
    resumeData.text,
    jdData.text
  );



  // weighted scoring
  const finalScore =
    skillScore * 0.4 +
    experienceScore * 0.2 +
    projectScore * 0.2+
    educationScore * 0.1+
    keywordsScore * 0.1;



  // suggestions
  const suggestions = [];

  if (missingSkills.length > 0) {
    suggestions.push(
      `Add missing skills: ${missingSkills.join(", ")}`
    );
  }

  if (resumeData.experience < jdData.requiredExperience) {
    suggestions.push(
      "Try to highlight more relevant experience or projects"
    );
  }

  if (projectScore < 50) {
    suggestions.push(
      "Improve project descriptions with relevant technologies"
    );
  }

  return {
    score: Math.round(finalScore),
    skillScore: Math.round(skillScore),
    experienceScore: Math.round(experienceScore),
    projectScore: Math.round(projectScore),
    educationScore: Math.round(educationScore),
    keywordsScore: Math.round(keywordsScore),
    missingSkills,
    suggestions
  };
};

module.exports = runATSAnalysis;
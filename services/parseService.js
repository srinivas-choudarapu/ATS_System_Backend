const extractTextFromPDF = require("../utils/extractText");


const skillList = [
  "javascript",
  "react",
  "node",
  "express",
  "mongodb",
  "python",
  "java",
  "sql",
  "aws",
  "docker"
];

const parseResume = (text) => {
  const lowerText = text.toLowerCase();

  // skills
  const skills = skillList.filter(skill =>
    lowerText.includes(skill)
  );

  // experience
  const experienceMatch = lowerText.match(/(\d+)\s+years?/);
  const experience = experienceMatch ? Number(experienceMatch[1]) : 0;

  // education
  const educationMatch = lowerText.match(
    /(b\.tech|btech|bachelor|m\.tech|mtech|master)/
  );
  const education = educationMatch ? educationMatch[0] : null;

  // projects section
  let projects = [];
  const projectSection = text.match(/projects([\s\S]*?)(education|skills|experience|activities|extracurricular|leadership|$)/i);

  if (projectSection) {
    projects = projectSection[1]
      .split("\n")
      .map(p => p.trim())
      .filter(p => p.length > 20); // remove short lines
  }

  return {
    skills,
    experience,
    education,
    projects
  };
};

const parseJD = (jdText) => {
  const lowerText = jdText.toLowerCase();

  const requiredSkills = skillList.filter(skill =>
    lowerText.includes(skill)
  );

  const expMatch = lowerText.match(/(\d+)\s+years?/);
  const requiredExperience = expMatch ? Number(expMatch[1]) : 0;

  return {
    requiredSkills,
    requiredExperience
  };
};

module.exports = { parseResume, parseJD };
// async function run() {
//   const text = await extractTextFromPDF("C:\\Users\\srinu\\Downloads\\srinivasresume.pdf");

//   const parsed = parseResume(text);

//   console.log(parsed);
// }

// run();

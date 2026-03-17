const calculateSkillScore = (resumeSkills, jdSkills) => {
  if (!jdSkills || jdSkills.length === 0) return 0;

  const matched = resumeSkills.filter(skill =>
    jdSkills.includes(skill)
  );

  return (matched.length / jdSkills.length) * 100;
};

const calculateExperienceScore = (resumeExp, jdExp) => {
  if (!jdExp) return 100;

  if (resumeExp >= jdExp) return 100;

  return (resumeExp / jdExp) * 100;
};

const calculateProjectScore = (projects, jdSkills) => {
  if (!projects || projects.length === 0) return 0;

  let matchCount = 0;

  projects.forEach(project => {
    const lowerProject = project.toLowerCase();

    jdSkills.forEach(skill => {
      if (lowerProject.includes(skill)) {
        matchCount++;
      }
    });
  });

  const totalPossible = jdSkills.length * projects.length;

  return totalPossible === 0
    ? 0
    : (matchCount / totalPossible) * 100;
};


const findMissingSkills = (resumeSkills, jdSkills) => {
  if (!jdSkills) return [];

  return jdSkills.filter(skill =>
    !resumeSkills.includes(skill)
  );
};


const calculateEducationScore = (resumeEdu, requiredEdu) => {
  if (!requiredEdu) return 100;
  if (!resumeEdu) return 0;

  const resume = resumeEdu.toLowerCase();
  const required = requiredEdu.toLowerCase();

  // Degree hierarchy
  const degreeLevels = {
    "phd": 4,
    "doctorate": 4,
    "master": 3,
    "m.tech": 3,
    "m.e": 3,
    "mba": 3,
    "bachelor": 2,
    "b.tech": 2,
    "b.e": 2,
    "bsc": 2,
    "bca": 2,
    "diploma": 1
  };

  // Extract degree level
  const getDegreeLevel = (text) => {
    for (let key in degreeLevels) {
      if (text.includes(key)) return degreeLevels[key];
    }
    return 0;
  };

  const resumeLevel = getDegreeLevel(resume);
  const requiredLevel = getDegreeLevel(required);

  let score = 0;

  if (resumeLevel >= requiredLevel) {
    score += 40;
  } else {
    score += 10; // partial
  }

  if (resume.includes(required)) {
    score += 40;
  }

  const fields = [
    "computer science",
    "cse",
    "information technology",
    "it",
    "electronics",
    "ece",
    "mechanical",
    "civil",
    "data science",
    "ai",
    "ml"
  ];

  let fieldScore = 0;
  for (let field of fields) {
    if (required.includes(field) && resume.includes(field)) {
      fieldScore = 20;
      break;
    }
  }

  score += fieldScore;

  return Math.min(100, score);
};




console.log(calculateSkillScore(['javascript', 'node.js'], ['javascript', 'react', 'node.js'])); // 66.67
console.log(calculateExperienceScore(5, 3)); // 100
console.log(calculateExperienceScore(2, 4)); // 50
console.log(calculateProjectScore(['Built a web app using React and Node.js'], ['react', 'node.js'])); // 100
console.log(findMissingSkills(['javascript', 'node.js'], ['javascript', 'react', 'node.js'])); // ['react']
console.log(calculateEducationScore('B.Tech in Computer Science', 'B.Tech')); // 100
console.log(calculateEducationScore('M.Tech in Computer Science', 'Master')); // 100
console.log(calculateEducationScore('High School Diploma', 'Bachelor')); // 0
module.exports = {
  calculateSkillScore,
  calculateExperienceScore,
  calculateProjectScore,
  findMissingSkills,
  calculateEducationScore
};
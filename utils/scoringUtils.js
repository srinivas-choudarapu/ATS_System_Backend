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

//for keywords score
const skillList = [
  "javascript","typescript","python","java","c","c++","cpp","c#","go","golang","rust","kotlin","swift","php","ruby","scala","dart","matlab",

  "html","html5","css","css3","sass","less","tailwind","bootstrap",
  "react","angular","vue","nextjs","nuxt","redux",

  "nodejs","express","spring","springboot","django","flask","fastapi","laravel","rails","aspnet",

  "mongodb","mysql","postgresql","sqlite","redis","oracle","cassandra","dynamodb","firebase",

  "aws","gcp","azure","digitalocean",

  "docker","kubernetes","k8s","jenkins","githubactions","gitlabci","terraform","ansible","nginx","apache",

  "rest","restapi","graphql","jwt","oauth","websockets",

  "machinelearning","ml","deeplearning","dl","nlp","computervision","tensorflow","pytorch","scikitlearn","pandas","numpy",

  "hadoop","spark","kafka","airflow","etl","datawarehousing","bigquery","snowflake","tableau","powerbi",

  "jest","mocha","chai","selenium","cypress","playwright","junit",

  "android","ios","reactnative","flutter","xamarin","swiftui",

  "microservices","monolith","restful","eventdriven","systemdesign","designpatterns","oop","dsa","algorithms",

  "git","github","gitlab","bitbucket",

  "cybersecurity","encryption","ssl","tls","oauth2","penetrationtesting",

  "linux","unix","windows",

  "agile","scrum","kanban","cicd","devops","debugging","performanceoptimization"
];
const cleanWord = (word) => {
  return word
    .toLowerCase()
    .replace(/[.\-\/]/g, "")   // remove ., -, /
    .replace(/\s+/g, "");      // remove spaces
};
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s.\-/]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(cleanWord);
};
const extractSkills = (text, skillSet) => {
  const words = normalizeText(text);
  const textStr = words.join(" ");

  const foundSkills = new Set();

  skillSet.forEach(skill => {
    if (textStr.includes(skill)) {
      foundSkills.add(skill);
    }
  });

  return foundSkills;
};

const calculateKeywordsScore = (resumeText, jdText) => {
  const skillSet = new Set(skillList);

  const resumeSkills = extractSkills(resumeText, skillSet);
  const jdSkills = extractSkills(jdText, skillSet);

  let matched = [];
  jdSkills.forEach(skill => {
    if (resumeSkills.has(skill)) {
      matched.push(skill);
    }
  });

  const score = jdSkills.size === 0
    ? 0
    : (matched.length / jdSkills.size) * 100;

  return score;
};

// console.log(calculateSkillScore(['javascript', 'node.js'], ['javascript', 'react', 'node.js'])); // 66.67
// console.log(calculateExperienceScore(5, 3)); // 100
// console.log(calculateExperienceScore(2, 4)); // 50
// console.log(calculateProjectScore(['Built a web app using React and Node.js'], ['react', 'node.js'])); // 100
// console.log(findMissingSkills(['javascript', 'node.js'], ['javascript', 'react', 'node.js'])); // ['react']
// console.log(calculateEducationScore('B.Tech in Computer Science', 'B.Tech')); // 100
// console.log(calculateEducationScore('M.Tech in Computer Science', 'Master')); // 100
// console.log(calculateEducationScore('High School Diploma', 'Bachelor')); // 0
//console.log(calculateKeywordsScore('Experience with React, Node.js, and AWS', 'Looking for React and AWS experience')); // { score: 100 } 
module.exports = {
  calculateSkillScore,
  calculateExperienceScore,
  calculateProjectScore,
  findMissingSkills,
  calculateEducationScore,
  calculateKeywordsScore
};
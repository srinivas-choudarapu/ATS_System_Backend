const extractTextFromPDF = require("../utils/extractText");


const skillList = [
  // 🌐 Programming Languages
  "javascript","typescript","python","java","c","c++","cpp","c#","go","golang","rust","kotlin","swift","php","ruby","scala","dart","matlab",

  // 🎨 Frontend
  "html","html5","css","css3","sass","less","tailwind","bootstrap",
  "react","reactjs","angular","angularjs","vue","vuejs","nextjs","next.js","nuxt","redux",

  // ⚙️ Backend
  "node","nodejs","express","expressjs","spring","springboot","django","flask","fastapi","laravel","rails","asp.net",

  // 🗄️ Databases
  "mongodb","mongo","mysql","postgres","postgresql","sqlite","redis","oracle","cassandra","dynamodb","firebase",

  // ☁️ Cloud
  "aws","amazon web services","gcp","google cloud","azure","digitalocean",

  // 🐳 DevOps & Tools
  "docker","kubernetes","k8s","jenkins","github actions","gitlab ci","terraform","ansible","nginx","apache",

  // 🔐 Authentication / APIs
  "rest","rest api","graphql","jwt","oauth","websockets",

  // 🧠 Data & AI
  "machine learning","ml","deep learning","dl","nlp","computer vision","tensorflow","pytorch","scikit-learn","pandas","numpy",

  // 📊 Data Engineering / Analytics
  "hadoop","spark","kafka","airflow","etl","data warehousing","bigquery","snowflake","tableau","powerbi",

  // 🧪 Testing
  "jest","mocha","chai","selenium","cypress","playwright","junit",

  // 📱 Mobile
  "android","ios","react native","flutter","xamarin","swiftui",

  // 🧩 Architecture / Concepts
  "microservices","monolith","restful","event-driven","system design","design patterns","oop","dsa","algorithms",

  // 🔧 Version Control / Tools
  "git","github","gitlab","bitbucket",

  // 🔒 Security
  "cybersecurity","encryption","ssl","tls","oauth2","penetration testing",

  // 🖥️ OS / Platforms
  "linux","unix","windows",

  // 🧾 Others (common JD terms)
  "agile","scrum","kanban","ci/cd","devops","debugging","performance optimization"
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

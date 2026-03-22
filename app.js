require("dotenv").config();

const express = require("express");
const cors = require("cors");
const resumeRoutes = require("./routes/resumeRoutes");
const analysisRoutes = require("./routes/analysisRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/resumes", resumeRoutes);
app.use("/api/analysis", analysisRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
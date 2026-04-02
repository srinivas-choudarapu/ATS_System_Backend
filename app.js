require("dotenv").config();
const cookieParser = require("cookie-parser");


const express = require("express");
const cors = require('cors');


const resumeRoutes = require("./routes/resumeRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const userRoutes = require("./routes/userRoutes");


const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,  // Your frontend URL
  credentials: true  // Allow credentials
}));
app.use(cookieParser());
app.use(express.json());
app.use("/api/resume", resumeRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
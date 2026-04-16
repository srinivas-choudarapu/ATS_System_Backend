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

app.get("/health", async (req, res) => {
  try {
    // Check if required environment variables are set
    const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "FRONTEND_URL"];
    const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

    if (missingVars.length > 0) {
      return res.status(500).json({ 
        status: "DOWN", 
        error: `Missing environment variables: ${missingVars.join(", ")}` 
      });
    }

    // If all checks pass
    res.status(200).json({ status: "OK" });
  } catch (error) {
    res.status(500).json({ 
      status: "DOWN", 
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/db");
const redisClient = require("./config/redis");

// routes
const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const aiRouter = require("./routes/aiChatting");
const videoRouter = require("./routes/videoCreator");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // ✅ Vercel URL
    credentials: true,
  })
);

/* -------------------- ROUTES -------------------- */
app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/ai", aiRouter);
app.use("/video", videoRouter);

/* -------------------- HEALTH CHECK -------------------- */
app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend is running 🚀" });
});

/* -------------------- SERVER START -------------------- */
const PORT = process.env.PORT || 3000;

const initializeConnection = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    // Redis should NOT crash the server
    try {
      await redisClient.connect();
      console.log("✅ Redis connected");
    } catch (redisErr) {
      console.warn("⚠️ Redis connection failed, continuing without Redis");
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
};

initializeConnection();

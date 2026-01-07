const express = require("express");
const app = express();
require("dotenv").config();

const main = require("./config/db");
const cookieParser = require("cookie-parser");
const redisClient = require("./config/redis");

const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const aiRouter = require("./routes/aiChatting");
const videoRouter = require("./routes/videoCreator");

const cors = require("cors");

// ✅ REQUIRED for Render + secure cookies
app.set("trust proxy", 1);

/* ======================
   CORS CONFIG (FIXED)
====================== */
app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server / Postman
      if (!origin) return callback(null, true);

      // allow localhost + all Vercel deployments
      if (
        origin === "http://localhost:5173" ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // ⭐ REQUIRED for cookies
  })
);

// preflight requests
app.options("*", cors());

/* ======================
   MIDDLEWARES
====================== */
app.use(express.json());
app.use(cookieParser());

/* ======================
   ROUTES
====================== */
app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/ai", aiRouter);
app.use("/video", videoRouter);

/* ======================
   SERVER START
====================== */
const PORT = process.env.PORT || 3000;

const initializeConnection = async () => {
  try {
    await Promise.all([
      main(),               // MongoDB
      redisClient.connect() // Redis
    ]);

    console.log("✅ DB & Redis Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};

initializeConnection();

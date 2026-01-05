const express = require("express");
const app = express();
require("dotenv").config();

const main = require("./config/db");
const cookieParser = require("cookie-parser");
const redisClient = require("./config/redis");
const cors = require("cors");

// routes
const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const aiRouter = require("./routes/aiChatting");
const videoRouter = require("./routes/videoCreator");

/* =======================
   TRUST PROXY (REQUIRED)
======================= */
app.set("trust proxy", 1);

/* =======================
   CORS CONFIG (FIXED)
======================= */
const corsOptions = {
  origin: "https://xcode-kohl.vercel.app", // HARD CODED (safe & correct)
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

/* IMPORTANT: CORS BEFORE ROUTES */
app.use(cors(corsOptions));

/* IMPORTANT: PRE-FLIGHT SUPPORT */
app.options("*", cors(corsOptions));

/* =======================
   MIDDLEWARE
======================= */
app.use(express.json());
app.use(cookieParser());

/* =======================
   ROUTES
======================= */
app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/ai", aiRouter);
app.use("/video", videoRouter);

/* =======================
   SERVER START
======================= */
const PORT = process.env.PORT || 5000;

const InitalizeConnection = async () => {
  try {
    await Promise.all([main(), redisClient.connect()]);
    console.log("DB Connected");

    app.listen(PORT, () => {
      console.log("Server listening at port number:", PORT);
    });
  } catch (err) {
    console.error("Error starting server:", err);
  }
};

InitalizeConnection();

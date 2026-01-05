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

// trust proxy (required on Render)
app.set("trust proxy", 1);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// routes
app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/ai", aiRouter);
app.use("/video", videoRouter);

const PORT = process.env.PORT || 5000;

const InitalizeConnection = async () => {
  try {
    await Promise.all([main(), redisClient.connect()]);
    console.log("DB Connected");

    app.listen(PORT, () => {
      console.log("Server listening at port number: " + PORT);
    });
  } catch (err) {
    console.error("Error:", err);
  }
};

InitalizeConnection();

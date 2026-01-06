const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis");

const userMiddleware = async (req, res, next) => {
  try {
    // 1️⃣ token must exist
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).send("Unauthorized: Token missing");
    }

    // 2️⃣ verify token
    const payload = jwt.verify(token, process.env.JWT_KEY);
    const { _id } = payload;

    if (!_id) {
      return res.status(401).send("Unauthorized: Invalid token");
    }

    // 3️⃣ check user exists
    const result = await User.findById(_id);
    if (!result) {
      return res.status(401).send("Unauthorized: User not found");
    }

    // 4️⃣ check Redis blacklist
    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked) {
      return res.status(401).send("Unauthorized: Token blocked");
    }

    // 5️⃣ attach user (THIS IS REQUIRED)
    req.result = result;

    next();
  } catch (err) {
    return res.status(401).send("Unauthorized");
  }
};

module.exports = userMiddleware;

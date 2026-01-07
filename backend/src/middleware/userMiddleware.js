const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis");

const userMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ Verify token with correct secret
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = payload;

    if (!_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(_id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ Redis check should NOT crash auth
    try {
      const isBlocked = await redisClient.exists(`token:${token}`);
      if (isBlocked) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    } catch {
      // Redis down → allow request (fail-open)
    }

    req.result = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = userMiddleware;

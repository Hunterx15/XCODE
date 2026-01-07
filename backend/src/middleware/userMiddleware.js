const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check Redis blacklist
    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);

    req.user = {
      _id: decoded._id,
      emailId: decoded.emailId,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = auth;

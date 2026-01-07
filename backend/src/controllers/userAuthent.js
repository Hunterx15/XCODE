const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const isProd = process.env.NODE_ENV === "production";

/* =======================
   HELPERS
======================= */
const createToken = (user) => {
  return jwt.sign(
    { _id: user._id, emailId: user.emailId, role: user.role },
    process.env.JWT_KEY,
    { expiresIn: "1h" }
  );
};

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,                 // true on Render
    sameSite: isProd ? "none" : "lax",
    maxAge: 60 * 60 * 1000,          // 1 hour
  });
};

/* =======================
   REGISTER
======================= */
const register = async (req, res) => {
  try {
    // 🚫 Block register if already logged in
    if (req.cookies?.token) {
      return res.status(409).json({
        message: "Already logged in. Logout to register a new account.",
      });
    }

    // Validate input (must THROW on error)
    validate(req.body);

    const { firstName, emailId, password } = req.body;

    // Check existing email
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered. Please login.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      firstName,
      emailId,
      password: hashedPassword,
      role: "user",
    });

    // Create token + cookie
    const token = createToken(user);
    setAuthCookie(res, token);

    res.status(201).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        emailId: user.emailId,
        role: user.role,
      },
      message: "Registered Successfully",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(400).json({
      message: err.message || "Registration failed",
    });
  }
};

/* =======================
   LOGIN
======================= */
const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = createToken(user);
    setAuthCookie(res, token);

    res.status(200).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        emailId: user.emailId,
        role: user.role,
      },
      message: "Logged In Successfully",
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* =======================
   LOGOUT
======================= */
const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(200).json({ message: "Already logged out" });
    }

    // Best-effort blacklist (logout should never fail)
    try {
      const payload = jwt.verify(token, process.env.JWT_KEY);

      await redisClient.set(`token:${token}`, "blocked");
      await redisClient.expireAt(
        `token:${token}`,
        Number(payload.exp)
      );
    } catch (err) {
      console.warn("Logout token/redis issue:", err.message);
    }

    // Clear cookie
    res.cookie("token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logged Out Successfully" });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    res.status(503).json({ message: "Logout Failed" });
  }
};

/* =======================
   ADMIN REGISTER (PROTECTED)
======================= */
const adminRegister = async (req, res) => {
  try {
    // 🚫 Disable in production
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        message: "Admin registration disabled in production",
      });
    }

    // 🚫 Only admins can create admins
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    validate(req.body);

    const { firstName, emailId, password } = req.body;

    const exists = await User.findOne({ emailId });
    if (exists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      emailId,
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin Registered Successfully",
      adminId: user._id,
    });
  } catch (err) {
    console.error("ADMIN REGISTER ERROR:", err);
    res.status(400).json({ message: err.message });
  }
};

/* =======================
   DELETE PROFILE
======================= */
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Profile Deleted Successfully" });
  } catch (err) {
    console.error("DELETE PROFILE ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile,
};

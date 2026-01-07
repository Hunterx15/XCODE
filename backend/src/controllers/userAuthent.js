const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* -------------------- COOKIE OPTIONS -------------------- */
const COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 60 * 60 * 1000, // 1 hour
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

/* -------------------- REGISTER -------------------- */
const register = async (req, res) => {
  try {
    // Validate request body
    validate(req.body);

    const { firstName, emailId, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
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

    // Generate JWT
    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set cookie
    res.cookie("token", token, COOKIE_OPTIONS);

    // Send response
    return res.status(201).json({
      user: {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role: user.role,
      },
      message: "Registered successfully",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    return res.status(400).json({ message: err.message });
  }
};

/* -------------------- LOGIN -------------------- */
const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(200).json({
      user: {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role: user.role,
      },
      message: "Login successful",
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    return res.status(500).json({ message: "Login failed" });
  }
};

/* -------------------- LOGOUT -------------------- */
const logout = async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (token) {
      try {
        const payload = jwt.decode(token);
        if (payload?.exp) {
          await redisClient.set(`token:${token}`, "blocked");
          await redisClient.expireAt(`token:${token}`, payload.exp);
        }
      } catch {
        // Redis failure should not crash logout
      }
    }

    res.cookie("token", "", { expires: new Date(0) });
    return res.json({ message: "Logged out successfully" });
  } catch {
    return res.json({ message: "Logged out" });
  }
};

/* -------------------- ADMIN REGISTER -------------------- */
const adminRegister = async (req, res) => {
  try {
    validate(req.body);

    const { firstName, emailId, password, role } = req.body;

    if (role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      firstName,
      emailId,
      password: hashedPassword,
      role: "admin",
    });

    return res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

/* -------------------- DELETE PROFILE -------------------- */
const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.result._id);
    return res.status(200).json({ message: "Deleted successfully" });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile,
};

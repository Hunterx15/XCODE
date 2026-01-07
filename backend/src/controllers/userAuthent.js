const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* -------------------- HELPERS -------------------- */
const COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 60 * 60 * 1000,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

/* -------------------- REGISTER -------------------- */
const register = async (req, res) => {
  try {
    validate(req.body);

    const { password } = req.body;
    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = "user";

    const user = await User.create(req.body);

    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(201).json({
      user: {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role: user.role,
      },
      message: "Logged in successfully",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
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

    res.status(200).json({
      user: {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role: user.role,
      },
      message: "Logged in successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

/* -------------------- LOGOUT -------------------- */
const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.send("Logged out");

    const payload = jwt.decode(token);
    if (payload?.exp) {
      try {
        await redisClient.set(`token:${token}`, "blocked");
        await redisClient.expireAt(`token:${token}`, payload.exp);
      } catch {
        // Redis failure should NOT crash logout
      }
    }

    res.cookie("token", "", { expires: new Date(0) });
    res.send("Logged out successfully");
  } catch (err) {
    res.status(200).send("Logged out");
  }
};

/* -------------------- ADMIN REGISTER -------------------- */
const adminRegister = async (req, res) => {
  try {
    validate(req.body);

    req.body.password = await bcrypt.hash(req.body.password, 10);

    const user = await User.create(req.body);

    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* -------------------- DELETE PROFILE -------------------- */
const deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.result._id);
    res.status(200).send("Deleted successfully");
  } catch {
    res.status(500).send("Internal server error");
  }
};

module.exports = {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile,
};

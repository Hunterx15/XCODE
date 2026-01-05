const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const Submission = require("../models/submission");

const isProd = process.env.NODE_ENV === "production";

/* =======================
   REGISTER
======================= */
const register = async (req, res) => {
  try {
    // 1️⃣ Validate request body
    validate(req.body);

    const { firstName, emailId, password } = req.body;

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Create user
    const user = await User.create({
      firstName,
      emailId,
      password: hashedPassword,
      role: "user",
    });

    // 4️⃣ Generate JWT
    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    // 5️⃣ Set cookie (SAFE for localhost + production)
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,                 // ❗ only true in production
      sameSite: isProd ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
    });

    // 6️⃣ Send response
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

    // Duplicate email
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

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

    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
    });

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
    res.status(500).json({ message: "Login failed" });
  }
};

/* =======================
   LOGOUT
======================= */
const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.send("Already Logged Out");

    const payload = jwt.decode(token);

    // Block token in redis
    await redisClient.set(`token:${token}`, "blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp);

    res.cookie("token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      expires: new Date(0),
    });

    res.send("Logged Out Successfully");
  } catch (err) {
    res.status(503).send("Logout Failed");
  }
};

/* =======================
   ADMIN REGISTER
======================= */
const adminRegister = async (req, res) => {
  try {
    validate(req.body);

    const { firstName, emailId, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      emailId,
      password: hashedPassword,
      role: "admin",
    });

    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: "admin" },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
    });

    res.status(201).send("Admin Registered Successfully");
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* =======================
   DELETE PROFILE
======================= */
const deleteProfile = async (req, res) => {
  try {
    const userId = req.result._id;

    await User.findByIdAndDelete(userId);
    // await Submission.deleteMany({ userId });

    res.status(200).send("Profile Deleted Successfully");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile,
};

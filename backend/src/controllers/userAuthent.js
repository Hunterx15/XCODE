const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Submission = require("../models/submission");

/* =======================
   REGISTER
======================= */
const register = async (req, res) => {
  console.log("REGISTER BODY:", req.body);

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
      { expiresIn: 60 * 60 }
    );

    // 5️⃣ Set secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,      // required on Render / HTTPS
      sameSite: "none",  // required for cross-site cookies
      maxAge: 60 * 60 * 1000,
    });

    // 6️⃣ Send response
    res.status(201).json({
      user: {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role: user.role,
      },
      message: "Registered successfully",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);

    // 🔴 Duplicate email (MongoDB unique index)
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // 🔴 Validation or other error
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

    if (!emailId) throw new Error("Invalid Credentials");
    if (!password) throw new Error("Invalid Credentials");

    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid Credentials");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid Credentials");

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );

    // 🔥 FIXED COOKIE (NO LOGIC CHANGE)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    });

    res.status(201).json({
      user: reply,
      message: "Logged In Successfully",
    });
  } catch (err) {
    res.status(401).send("Error: " + err.message);
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

    await redisClient.set(`token:${token}`, "Blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp);

    res.cookie("token", null, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now()),
    });

    res.send("Logged Out Successfully");
  } catch (err) {
    res.status(503).send("Error: " + err.message);
  }
};

/* =======================
   ADMIN REGISTER
======================= */
const adminRegister = async (req, res) => {
  try {
    validate(req.body);

    const { firstName, emailId, password } = req.body;

    req.body.password = await bcrypt.hash(password, 10);

    const user = await User.create(req.body);

    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    });

    res.status(201).send("User Registered Successfully");
  } catch (err) {
    res.status(400).send("Error: " + err.message);
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

    res.status(200).send("Deleted Successfully");
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

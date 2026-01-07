const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile,
} = require("../controllers/userAuthent");

const auth = require("../middleware/auth");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public
router.post("/register", register);
router.post("/login", login);

// Protected
router.post("/logout", auth, logout);
router.get("/me", auth, (req, res) => {
  res.status(200).json({ user: req.user });
});
router.delete("/deleteProfile", auth, deleteProfile);

// Admin
router.post("/admin/register", auth, adminMiddleware, adminRegister);

module.exports = router;


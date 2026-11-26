const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, department } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: "Name, email, password and role are required" });
    if (!["admin", "faculty", "student"].includes(role)) return res.status(400).json({ message: "Invalid role" });
    if (password.length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters" });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email is already registered" });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role, rollNumber, department });
    res.status(201).json({ message: "Account created", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ message: "Could not create account" }); }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: (req.body.email || "").toLowerCase() });
    if (!user || !(await bcrypt.compare(req.body.password || "", user.passwordHash)))
      return res.status(401).json({ message: "Incorrect email or password" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch { res.status(500).json({ message: "Login failed" }); }
});
router.get("/me", authenticate, (req, res) => res.json({ user: req.user }));
module.exports = router;

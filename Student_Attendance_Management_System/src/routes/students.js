const router = require("express").Router();
const User = require("../models/User");
const { authenticate, allowRoles } = require("../middleware/auth");
router.get("/", authenticate, allowRoles("admin", "faculty"), async (req, res) => {
  const students = await User.find({ role: "student" }).select("name email rollNumber department").sort({ name: 1 });
  res.json(students);
});
router.post("/", authenticate, allowRoles("admin"), async (req, res) => {
  try {
    const { name, email, password, rollNumber, department } = req.body;
    if (!name || !email || !password || !rollNumber) return res.status(400).json({ message: "Name, email, password and roll number are required" });
    if (await User.findOne({ $or: [{ email: email.toLowerCase() }, { rollNumber }] })) return res.status(409).json({ message: "Email or roll number already exists" });
    const bcrypt = require("bcryptjs");
    const student = await User.create({ name, email, rollNumber, department, role: "student", passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ id: student._id, name: student.name, rollNumber: student.rollNumber });
  } catch { res.status(500).json({ message: "Could not add student" }); }
});
module.exports = router;

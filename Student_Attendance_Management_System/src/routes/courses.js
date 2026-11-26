const router = require("express").Router();
const Course = require("../models/Course");
const { authenticate, allowRoles } = require("../middleware/auth");
router.get("/", authenticate, async (req, res) => {
  const courses = await Course.find().populate("facultyId", "name email").sort({ courseName: 1 });
  res.json(courses);
});
router.post("/", authenticate, allowRoles("admin"), async (req, res) => {
  try {
    const { courseCode, courseName, section, facultyId } = req.body;
    if (!courseCode || !courseName) return res.status(400).json({ message: "Course code and name are required" });
    const course = await Course.create({ courseCode, courseName, section, facultyId: facultyId || undefined });
    res.status(201).json(course);
  } catch { res.status(400).json({ message: "Could not create course. Check for duplicate course code and section." }); }
});
module.exports = router;

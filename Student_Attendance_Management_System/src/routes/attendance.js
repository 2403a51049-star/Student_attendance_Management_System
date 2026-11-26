const router = require("express").Router();
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Course = require("../models/Course");
const { authenticate, allowRoles } = require("../middleware/auth");

router.post("/", authenticate, allowRoles("faculty", "admin"), async (req, res) => {
  try {
    const { courseId, date, records } = req.body;
    if (!courseId || !date || !Array.isArray(records) || !records.length) return res.status(400).json({ message: "Course, date and attendance records are required" });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    const validStudents = await User.find({ _id: { $in: records.map(r => r.studentId) }, role: "student" }).select("_id");
    if (validStudents.length !== records.length) return res.status(400).json({ message: "One or more student IDs are invalid" });
    const operations = records.map(r => ({
      updateOne: {
        filter: { studentId: r.studentId, courseId, date },
        update: { $set: { status: r.status, markedBy: req.user._id } },
        upsert: true
      }
    }));
    await Attendance.bulkWrite(operations);
    res.json({ message: "Attendance saved successfully" });
  } catch { res.status(500).json({ message: "Could not save attendance" }); }
});

router.get("/mine", authenticate, async (req, res) => {
  try {
    const query = req.user.role === "student" ? { studentId: req.user._id } : {};
    const rows = await Attendance.find(query).populate("studentId", "name rollNumber").populate("courseId", "courseCode courseName").sort({ date: -1 });
    const summary = {};
    rows.forEach(r => {
      const key = `${r.courseId._id}`;
      if (!summary[key]) summary[key] = { course: r.courseId.courseName, total: 0, present: 0 };
      summary[key].total++;
      if (r.status === "Present") summary[key].present++;
    });
    const summaries = Object.values(summary).map(s => ({ ...s, percentage: s.total ? Number((s.present / s.total * 100).toFixed(1)) : 0 }));
    res.json({ records: rows, summaries });
  } catch { res.status(500).json({ message: "Could not load attendance" }); }
});
module.exports = router;

const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, trim: true },
  courseName: { type: String, required: true, trim: true },
  section: { type: String, default: "A" },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });
courseSchema.index({ courseCode: 1, section: 1 }, { unique: true });
module.exports = mongoose.model("Course", courseSchema);

const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  grade: { type: String, required: true },
});

const SemesterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  enrollmentNumber: { type: String, required: true },
  semesterNumber: { type: Number, required: true },
  subjects: [SubjectSchema],
});

module.exports = mongoose.model("Semester", SemesterSchema);

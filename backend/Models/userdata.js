const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  marks: { type: Number, required: true }
});

const SemesterSchema = new mongoose.Schema({
  semesterNumber: { type: Number, required: true },
  subjects: [SubjectSchema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to UserModel1
});

module.exports = mongoose.model('Semester', SemesterSchema);

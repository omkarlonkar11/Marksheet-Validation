const express = require("express");
const router = express.Router();
const semesterController = require("../Controllers/SemesterDataController");

// GET /api/semesters/:enrollmentNumber/:semesterNumber
router.get("/:enrollmentNumber/:semesterNumber", semesterController.getSemesterData);

module.exports = router;
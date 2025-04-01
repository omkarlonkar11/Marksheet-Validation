const Semester = require("../Models/userdata"); 

// Get a specific semester for a given enrollmentNumber
exports.getSemesterData = async (req, res) => {
  try {
    const { enrollmentNumber, semesterNumber } = req.params;

    // Find the semester matching BOTH enrollmentNumber and semesterNumber
    const semester = await Semester.findOne({ 
      enrollmentNumber,
      semesterNumber: Number(semesterNumber) // Ensure numeric comparison
    });

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found for the provided enrollment and semester number.",
      });
    }

    res.status(200).json({
      success: true,
      data: semester, // Returns the specific semester document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
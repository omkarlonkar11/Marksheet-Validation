const Semester = require("../Models/userdata");
const { keccak256, toUtf8Bytes } = require("ethers"); // Correct import

// Get a specific semester for a given enrollmentNumber
exports.getSemesterData = async (req, res) => {
  try {
    const { enrollmentNumber, semesterNumber } = req.params;

    // Find the semester matching BOTH enrollmentNumber and semesterNumber
    const semester = await Semester.findOne({
      enrollmentNumber,
      semesterNumber: Number(semesterNumber), // Ensure numeric comparison
    });

    if (!semester) {
      return res.status(404).json({
        success: false,
        message:
          "Semester not found for the provided enrollment and semester number.",
      });
    }

    console.log(semester);

    // Generate Keccak-256 hash
    const hash = keccak256(
      toUtf8Bytes(`${enrollmentNumber.trim()}-${semester.semesterNumber}`)
    );

    console.log("Hash:", hash);

    res.status(200).json({
      success: true,
      hash, // Returns the generated hash
      semesterData: semester,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message, // Return error message
      message: "Internal server error",
    });
  }
};

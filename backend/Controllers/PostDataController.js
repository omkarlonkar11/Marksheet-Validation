const UserModel = require("../Models/userdata"); // Semester Model

const postdata = async (req, res) => {
  try {
    const { name, enrollmentNumber, semesterNumber, subjects, hash } = req.body;

    // Validate required fields
    if (!semesterNumber || !subjects || !name || !enrollmentNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Upsert the semester: if it exists, update it. If not, create it.
    const newSemester = await UserModel.findOneAndUpdate(
      { enrollmentNumber, semesterNumber },
      { name, enrollmentNumber, semesterNumber, subjects, hash },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Semester synchronized successfully",
      semester: newSemester,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error saving data",
      details: error.message,
    });
  }
};

module.exports = postdata;

const UserModel = require("../Models/userdata"); // Semester Model

const postdata = async (req, res) => {
  try {
    const { name, enrollmentNumber, semesterNumber, subjects } = req.body;

    // Validate required fields
    if (!semesterNumber || !subjects || !name || !enrollmentNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // // Check if semester already exists for this user
    console.log(req.body);
    console.log(subjects);
    // If semester doesn't exist, add a new semester
    let newSemester = new UserModel({
      name,
      enrollmentNumber,
      semesterNumber,
      subjects,
    });

    await newSemester.save();

    res.status(201).json({
      message: "Semester added successfully",
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

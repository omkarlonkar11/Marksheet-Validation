const UserModel1 = require("../Models/user"); // Auth Model
const UserModel = require("../Models/userdata"); // Semester Model

const postdata = async (req, res) => {
  try {
    const { email, semesterNumber, subjects } = req.body;

    // Validate required fields
    if (!email || !semesterNumber || !subjects) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the user from authentication model
    let user = await UserModel1.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if semester already exists for this user
    let semesterExists = await UserModel.findOne({
      user: user._id,
      semesterNumber,
    });

    if (semesterExists) {
      return res.status(409).json({
        error: "Semester already exists. Cannot add duplicate semester.",
      });
    }

    // If semester doesn't exist, add a new semester
    let newSemester = new UserModel({
      semesterNumber,
      subjects,
      user: user._id, // Reference to user
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

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils/utils";
import { keccak256 } from "ethers";
import { useWeb3Context } from "../contexts/Web3Context";

const Home: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [semester, setSemester] = useState<string>("");
  const [subjects, setSubjects] = useState<{ name: string; marks: string }[]>(
    []
  );

  const { web3State } = useWeb3Context();
  const [name, setName] = useState<string>("");
  const [enrollmentNumber, setEnrollmentNumber] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (!user) {
      navigate("/login");
    } else {
      setLoggedInUser(user);
    }
  }, [navigate]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEnrollmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnrollmentNumber(e.target.value);
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if ((value > 0 && value < 9) || e.target.value === "") {
      setSemester(e.target.value);
    } else {
      handleError("Semester must be between 1 and 8!");
    }
  };

  const handleSubjectChange = (index: number, value: string) => {
    const isDuplicate = subjects.some(
      (subject, i) =>
        i !== index &&
        subject.name.trim().toLowerCase() === value.trim().toLowerCase()
    );

    if (isDuplicate) {
      handleError(`"${value}" is already added as a subject`);
      return;
    }

    setSubjects((prev) => {
      const updated = [...prev];
      updated[index].name = value;
      return updated;
    });
  };

  const handleMarksChange = (index: number, value: string) => {
    if (/^\d*$/.test(value)) {
      const marks = Number(value);
      if (marks > 100) {
        handleError("Marks cannot be greater than 100");
        return;
      }

      setSubjects((prev) => {
        const updated = [...prev];
        updated[index].marks = value;
        return updated;
      });
    }
  };

  function getGrade(marks: number): string {
    if (marks >= 80 && marks <= 100) return "O";
    else if (marks >= 70) return "A+";
    else if (marks >= 60) return "A";
    else if (marks >= 55) return "B+";
    else if (marks >= 50) return "B";
    else if (marks >= 45) return "C";
    else if (marks >= 40) return "P";
    else if (marks >= 0) return "F";
    else return "Ab"; // If input is negative, consider absent
  }

  const addSubject = () => {
    if (subjects.length < 5) {
      setSubjects([...subjects, { name: "", marks: "" }]);
    } else {
      handleError("You can add exactly 5 subjects");
    }
  };

  const generateKeccak256Hash = (data: object): string => {
    const normalizedData = JSON.stringify(data, Object.keys(data).sort());

    // Convert string to Uint8Array using TextEncoder
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(normalizedData);

    // Compute Keccak-256 hash
    return keccak256(encodedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const subjectNames = subjects.map((subject) =>
      subject.name.trim().toLowerCase()
    );
    const uniqueSubjects = new Set(subjectNames);
    if (uniqueSubjects.size !== subjects.length) {
      handleError(
        "Duplicate subjects found. Please remove duplicates before submitting."
      );
      return;
    }

    if (!name.trim()) {
      handleError("Please enter your name");
      return;
    }

    if (!enrollmentNumber.trim()) {
      handleError("Please enter your enrollment number");
      return;
    }

    if (!semester) {
      handleError("Please select a semester");
      return;
    }

    if (subjects.length !== 5) {
      handleError("Enter exactly 5 subjects before submitting");
      return;
    }

    if (
      subjects.some(
        (subject) => subject.name.trim() === "" || subject.marks.trim() === ""
      )
    ) {
      handleError("All subjects must have a valid name and marks");
      return;
    }

    const data = {
      name: name.trim(),
      enrollmentNumber: enrollmentNumber.trim(),
      semesterNumber: Number(semester),
      subjects: subjects.map((subject) => ({
        name: subject.name.trim(),
        grade: getGrade(Number(subject.marks)),
      })),
    };

    try {
      console.log("Data to be sent:", data);
      const response = await fetch("http://localhost:8080/semester/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log(response);
      const responseData = await response.json();

      if (!response.ok) {
        handleError(responseData.message || "Marks for Semester Already Exist");
        return;
      }
      const hash = generateKeccak256Hash(data);
      console.log(hash);

      if (!web3State.contractInstance) {
        console.error("Contract is not initialized yet.");
        return;
      }

      if (!web3State.contractInstance?.storeHash) {
        console.error("storeHash method is undefined. Check contract ABI.");
        return;
      }

      const tx = await web3State.contractInstance?.storeHash(
        enrollmentNumber,
        hash
      );
      await tx.wait(); // Wait for transaction confirmation
      console.log("Transaction Successful:", tx);

      handleSuccess("Marks entered successfully");
    } catch (error) {
      console.error("Error submitting marks:", error);
      handleError(
        (error as Error).message || "Failed to submit marks. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div>
          <h2 className="text-2xl font-semibold text-center mb-4">
            Welcome, {loggedInUser || "Guest"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Enter Name:
              </label>
              <input
                type="text"
                value={name}
                placeholder="Enter Your Name"
                onChange={handleNameChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Enter Enrollment Number:
              </label>
              <input
                type="text"
                value={enrollmentNumber}
                placeholder="I2K123456"
                onChange={handleEnrollmentChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Enter Semester:
              </label>
              <input
                type="number"
                value={semester}
                onChange={handleSemesterChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="8"
                required
              />
            </div>

            {subjects.map((subject, index) => (
              <div key={index} className="flex flex-col">
                <label className="text-gray-700 font-medium">
                  Subject {index + 1}:
                </label>
                <input
                  type="text"
                  value={subject.name}
                  onChange={(e) => handleSubjectChange(index, e.target.value)}
                  placeholder="Enter Subject Name"
                  className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  required
                />
                <input
                  type="number"
                  value={subject.marks}
                  onChange={(e) => handleMarksChange(index, e.target.value)}
                  placeholder="Enter Marks (0-100)"
                  className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  required
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addSubject}
              disabled={subjects.length >= 5}
              className={`w-full py-2 rounded-lg transition ${
                subjects.length >= 5
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}>
              + Add Subject
            </button>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
              Submit Marks
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Home;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [semester, setSemester] = useState<string>("");
  const [subjects, setSubjects] = useState<{ name: string; marks: string }[]>(
    []
  );
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (!user) {
      navigate("/login"); // Redirect to login page if not logged in
    } else {
      setLoggedInUser(user);
    }
  }, [navigate]);

  const handleSemesterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if ((value > 0 && value < 9) || e.target.value === "") {
      setSemester(e.target.value);
    } else {
      alert("Semester must be between 1 and 8!");
    }
  };

  const handleSubjectChange = (index: number, value: string) => {
    setSubjects((prev) => {
      const updated = [...prev];
      updated[index].name = value;
      return updated;
    });
  };

  const handleMarksChange = (index: number, value: string) => {
    if (/^\d*$/.test(value)) {
      setSubjects((prev) => {
        const updated = [...prev];
        updated[index].marks = value; // Keep marks as an empty string initially
        return updated;
      });
    }
  };

  const addSubject = () => {
    if (subjects.length < 5) {
      setSubjects([...subjects, { name: "", marks: "" }]); // No initial value in marks
    } else {
      alert("You can only add exactly 5 subjects!");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (subjects.length !== 5) {
      alert("You must enter exactly 5 subjects before submitting.");
      return;
    }

    if (
      subjects.some(
        (subject) => subject.name.trim() === "" || subject.marks.trim() === ""
      )
    ) {
      alert("All subjects must have a valid name and marks.");
      return;
    }

    const data = { loggedInUser, semester, subjects };

    fetch("http://localhost:5000/saveMarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(() => alert("Marks submitted successfully"))
      .catch((error) => console.error("Error submitting marks:", error));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        {loggedInUser ? (
          <div>
            <h2 className="text-2xl font-semibold text-center mb-4">
              Welcome, {loggedInUser}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Semester Input */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Enter Semester:
                </label>
                <input
                  type="number"
                  value={semester}
                  onChange={handleSemesterChange}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Dynamic Subject Fields */}
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
                    type="text"
                    value={subject.marks}
                    onChange={(e) => handleMarksChange(index, e.target.value)}
                    placeholder="Enter Marks"
                    className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              ))}

              {/* Add Subject Button (Disabled when 5 subjects are reached) */}
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

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
                Submit Marks
              </button>
            </form>
          </div>
        ) : (
          <h2 className="text-xl font-semibold text-center">Hello, Guest</h2>
        )}
      </div>
    </div>
  );
};

export default Home;

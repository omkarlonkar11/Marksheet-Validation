import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Subject {
  name: string;
  marks: number;
  grade: string;
}

interface StudentData {
  name: string;
  enrollmentNumber: string;
  semester: string;
  subjects: Subject[];
}

export default function Marksheet() {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [totalGradePoints, setTotalGradePoints] = useState<string>("0");
  const [sgpa, setSgpa] = useState<string>("0");
  const [overallGrade, setOverallGrade] = useState<string>("");
  const navigate = useNavigate();

  // Get current date for the marksheet
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    // Get student data from localStorage
    const studentDataStr = localStorage.getItem("studentData");
    const totalGradePointsStr = localStorage.getItem("totalGradePoints");
    const sgpaStr = localStorage.getItem("sgpa");
    
    if (!studentDataStr) {
      // If no data found, redirect to home page
      navigate("/home");
      return;
    }

    const studentData = JSON.parse(studentDataStr);
    setStudent(studentData);
    
    if (totalGradePointsStr) {
      setTotalGradePoints(totalGradePointsStr);
    }
    
    if (sgpaStr) {
      setSgpa(sgpaStr);
      // Determine overall grade based on SGPA
      const numSgpa = parseFloat(sgpaStr);
      if (numSgpa >= 9.5) setOverallGrade("O");
      else if (numSgpa >= 8.5) setOverallGrade("A+");
      else if (numSgpa >= 7.5) setOverallGrade("A");
      else if (numSgpa >= 6.5) setOverallGrade("B+");
      else if (numSgpa >= 5.5) setOverallGrade("B");
      else if (numSgpa >= 4.5) setOverallGrade("C");
      else if (numSgpa >= 4.0) setOverallGrade("P");
      else setOverallGrade("F");
    }
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-md shadow-md">
          <p className="text-gray-700">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-md shadow-md max-w-4xl w-full">
        {/* Watermark - only visible when printing */}
        <div className="fixed inset-0 flex items-center justify-center opacity-5 pointer-events-none print:block hidden">
          <div className="rotate-45 text-9xl font-bold text-gray-300">OFFICIAL</div>
        </div>
        
        {/* Header */}
        <div className="flex items-start p-6 border-b-2 border-gray-300">
          {/* Logo */}
          <img
            src="/pic.jpg"
            alt="College Logo"
            className="w-20 h-20 mr-6 object-contain"
          />
          
          {/* Header Text */}
          <div>
            <p className="text-sm text-gray-600 font-medium">
              Society for Computer Technology and Research's
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              PUNE INSTITUTE OF COMPUTER TECHNOLOGY
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              (An Autonomous Institute affiliated to Savitribai Phule Pune University)
            </p>
            <p className="text-xs text-gray-500 mt-1">
              AICTE APPROVED | ISO 9001:2015 | NAAC A+ Grade | NBA [All Eligible UG Programs]
            </p>
          </div>
        </div>

        {/* Document title and date row */}
        <div className="border-b border-gray-300 px-6 py-3 flex justify-between items-center bg-gray-50">
          <p className="text-gray-800 font-semibold">STATEMENT OF GRADES</p>
          <p className="text-gray-600">Date: {formattedDate}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student Details */}
          <div className="border border-gray-200 p-4 rounded-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 pb-1 border-b border-gray-200">
              Student Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 font-medium text-sm">Name</p>
                <p className="text-gray-900">{student.name}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium text-sm">Enrollment No.</p>
                <p className="text-gray-900">{student.enrollmentNumber}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium text-sm">Semester</p>
                <p className="text-gray-900">{student.semester}</p>
              </div>
            </div>
          </div>

          {/* Subjects & Marks */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Subjects & Marks
            </h2>
            <div className="overflow-x-auto border border-gray-200 rounded-md">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-b border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      No.
                    </th>
                    <th className="border-b border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="border-b border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {student.subjects.map((subject, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                        {subject.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        {subject.grade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="border border-gray-200 p-4 rounded-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 pb-1 border-b border-gray-200">
              Performance Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-600 font-medium text-sm">Total Grade Points</p>
                <p className="text-gray-900 text-xl font-medium mt-1">{totalGradePoints}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-600 font-medium text-sm">Semester GPA (SGPA)</p>
                <p className="text-gray-900 text-xl font-medium mt-1">{sgpa}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-gray-600 font-medium text-sm">Overall Grade</p>
                <p className="text-gray-900 text-xl font-medium mt-1">{overallGrade}</p>
              </div>
            </div>
          </div>
          
          {/* Grade Description */}
          <div className="border border-gray-200 p-4 rounded-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 pb-1 border-b border-gray-200">
              Grade Description
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div><span className="font-medium">O:</span> Outstanding (10)</div>
              <div><span className="font-medium">A+:</span> Excellent (9)</div>
              <div><span className="font-medium">A:</span> Very Good (8)</div>
              <div><span className="font-medium">B+:</span> Good (7)</div>
              <div><span className="font-medium">B:</span> Above Average (6)</div>
              <div><span className="font-medium">C:</span> Average (5)</div>
              <div><span className="font-medium">P:</span> Pass (4)</div>
              <div><span className="font-medium">F:</span> Fail (0)</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-300 bg-gray-50">
          {/* Signature Block */}
          <div className="flex flex-col">
            <div className="h-16"></div>
            <div className="w-40 border-t border-gray-400"></div>
            <p className="text-gray-600 text-sm mt-1">Controller of Examination</p>
          </div>
          
          {/* College Seal */}
          <div className="flex flex-col items-center mx-4">
            <div className="w-24 h-24 border border-gray-300 rounded-full flex items-center justify-center bg-gray-50">
              <span className="text-xs text-gray-500">Official Seal</span>
            </div>
          </div>
          
          {/* Print Button */}
          <button 
            onClick={handlePrint}
            className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-md shadow-sm text-sm print:hidden">
            Print Marksheet
          </button>
        </div>
        
        {/* Important Note */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 italic text-center">
          This document is electronically generated and does not require signature if verified online. 
          To verify, please visit the official institute website.
        </div>
      </div>
    </div>
  );
}

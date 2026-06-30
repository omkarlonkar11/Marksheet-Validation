// src/pages/BulkMarksheets.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import {
  BatchResult,
  StudentData,
  generateMarksheetHash,
} from "../utils/blockchain";

// Helper function to calculate grades and SGPA for a single student
const processStudentData = (student: StudentData) => {
  const gradePoints = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, P: 4, F: 0 };

  const getGrade = (marks: number): string => {
    if (marks >= 80) return "O";
    if (marks >= 70) return "A+";
    if (marks >= 60) return "A";
    if (marks >= 55) return "B+";
    if (marks >= 50) return "B";
    if (marks >= 45) return "C";
    if (marks >= 40) return "P";
    return "F";
  };

  // Extract subjects and marks from the 'marks' object, excluding identifying info
  const subjects = Object.keys(student.marks)
    .filter((key) => !["Enrollment Number", "Semester", "Name"].includes(key))
    .map((subjectName) => {
      const marks = Number(student.marks[subjectName]) || 0;
      return {
        name: subjectName,
        marks: marks,
        grade: getGrade(marks),
      };
    });

  const totalGradePoints = subjects.reduce(
    (total, s) =>
      total + (gradePoints[s.grade as keyof typeof gradePoints] || 0),
    0,
  );
  const sgpa =
    subjects.length > 0
      ? (totalGradePoints / subjects.length).toFixed(2)
      : "0.00";

  // Generate a verification URL for the QR code instead of raw hash
  const hash = generateMarksheetHash(student.marks);
  const VERIFIER_URL = import.meta.env.VITE_VERIFIER_URL || "http://localhost:5176";
  const qrCodeData = `${VERIFIER_URL}/verify/${student.enrollmentNumber}/${student.semester}?hash=${hash}`;

  return { ...student, subjects, sgpa, qrCodeData };
};

// A self-contained Marksheet component for individual display
const MarksheetCard: React.FC<{ student: any }> = ({ student }) => {
  return (
    <div className="bg-white rounded-md shadow-md max-w-4xl w-full mb-8 break-inside-avoid">
      {/* Header */}
      <div className="flex items-start p-6 border-b-2 border-gray-300">
        <img
          src="/pic.jpg"
          alt="College Logo"
          className="w-20 h-20 mr-6 object-contain"
        />
        <div>
          <p className="text-sm text-gray-600 font-medium">
            Society for Computer Technology and Research's
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            PUNE INSTITUTE OF COMPUTER TECHNOLOGY
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            (An Autonomous Institute affiliated to Savitribai Phule Pune
            University)
          </p>
        </div>
      </div>
      <div className="border-b border-gray-300 px-6 py-3 bg-gray-50">
        <p className="text-gray-800 font-semibold">STATEMENT OF GRADES</p>
      </div>
      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Student Details */}
        <div className="border border-gray-200 p-4 rounded-md">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600 font-medium text-sm">Name</p>
              <p className="text-gray-900">{student.name}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium text-sm">
                Enrollment No.
              </p>
              <p className="text-gray-900">{student.enrollmentNumber}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium text-sm">Semester</p>
              <p className="text-gray-900">{student.semester}</p>
            </div>
          </div>
        </div>
        {/* Subjects & Marks */}
        <div className="overflow-x-auto border border-gray-200 rounded-md">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                  No.
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                  Subject
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {student.subjects.map((subject: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {subject.name}
                  </td>
                  <td className="px-4 py-2 text-sm font-medium">
                    {subject.grade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Performance Summary */}
        <div className="border border-gray-200 p-4 rounded-md">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-600 font-medium text-sm">
                Semester GPA (SGPA)
              </p>
              <p className="text-gray-900 text-xl font-medium mt-1">
                {student.sgpa}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-gray-300 bg-gray-50">
        <div>
          <QRCode
            value={student.qrCodeData}
            size={80}
            level="H"
          />
          <p className="text-gray-600 text-xs mt-1">Blockchain Verification</p>
        </div>
        <div className="flex flex-col">
          <div className="h-16"></div>
          <div className="w-40 border-t border-gray-400"></div>
          <p className="text-gray-600 text-sm mt-1">
            Controller of Examination
          </p>
        </div>
      </div>
    </div>
  );
};

export default function BulkMarksheets() {
  const [processedStudents, setProcessedStudents] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const bulkResultsStr = sessionStorage.getItem("bulkUploadResults");
    if (bulkResultsStr) {
      const results: BatchResult = JSON.parse(bulkResultsStr);
      const studentsToDisplay = results.successful.map(processStudentData);
      setProcessedStudents(studentsToDisplay);
      sessionStorage.removeItem("bulkUploadResults");
      return;
    }

    const singleStudentStr = localStorage.getItem("studentData");
    if (singleStudentStr) {
      const studentData = JSON.parse(singleStudentStr);
      const sgpa = localStorage.getItem("sgpa") || "0.00";
      const qrCodeData = localStorage.getItem("qrCodeData") || "";

      setProcessedStudents([
        {
          ...studentData,
          sgpa,
          qrCodeData,
        },
      ]);
      localStorage.removeItem("studentData");
      localStorage.removeItem("sgpa");
      localStorage.removeItem("qrCodeData");
      return;
    }

    navigate("/home");
  }, [navigate]);

  if (processedStudents.length === 0) {
    return (
      <div className="text-center p-8">
        Loading results or no successful uploads found...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto mb-8 print:hidden">
        <button
          onClick={() => window.print()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          Print All Marksheets
        </button>
      </div>
      {processedStudents.map((student, index) => (
        <MarksheetCard key={index} student={student} />
      ))}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils/utils";
import {
  parseExcelFile,
  processBulkMarksheets,
  storeMarksheetHashOnBlockchain,
  BatchResult,
  syncWithDatabase,
  StudentData,
  generateMarksheetHash,
} from "../utils/blockchain";
import { connectWallet } from "../utils/ConnectWallet";
import { Contract } from "ethers";

/* ---- All subject options PRESERVED unchanged ---- */
const subjectOptions: Record<string, string[]> = {
  "1": ["Mathematics I", "Electronics", "Chemistry", "Mechanical Engineering", "Programming"],
  "2": ["Mathematics II", "Physics", "Electrical", "Mechanics", "Graphics"],
  "3": ["Dicrete Mathematics", "Data Structures", "Logic Design and Computer Organization", "Object Oriented Programming", "Basics of Computer Network"],
  "4": ["Mathematics- III ", "Database Systems", "Processor Architecture", "Software Engineering", "Computer Graphics"],
  "5": ["Theory of Computation", "Operating Systems ", "Machine Learning", "Human ComputerInteraction", "Adv Data Structures"],
  "6": ["Computer Network and Security", "Data Science and Big Data Analytics", "Cloud Computing", "Internship", "Web Application Development "],
  "7": ["Deep Learning", "Software Project Management ", "Information and Storage Retrieval", "Internet of Things", "Quantum Computing"],
  "8": ["Distributed Systems", "Software Defined Network", "Ethics in Technology", "Blockchain Technology", "Seminar"],
};

/* ---- Label styles helper ---- */
const Label = ({ children }: { children: React.ReactNode }) => (
  <label style={{
    display: "block",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#94a3b8",
    marginBottom: "7px",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  }}>
    {children}
  </label>
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
  const [semester, setSemester] = useState<string>("");
  const [subjects, setSubjects] = useState<{ name: string; marks: string }[]>([]);
  const [name, setName] = useState<string>("");
  const [enrollmentNumber, setEnrollmentNumber] = useState<string>("");
  const [contract, setContract] = useState<Contract | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);

  /* ---- All original effects & handlers PRESERVED unchanged ---- */
  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (!user) navigate("/login");
    else setLoggedInUser(user);

    const initBlockchain = async () => {
      const connection = await connectWallet();
      if (connection) setContract(connection.contractInstance);
      else console.log("Blockchain initialization failed, contract not set.");
    };
    initBlockchain();
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
      setBatchResult(null);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleBulkSubmit = async () => {
    if (!file) return handleError("Please select an Excel file first.");
    if (!contract) return handleError("Blockchain connection is not available. Please connect your wallet.");

    setIsProcessing(true);
    setBatchResult(null);
    setProgress({ current: 0, total: 0 });

    try {
      const students = await parseExcelFile(file);
      const onProgressUpdate = (current: number, total: number) => setProgress({ current, total });
      const result = await processBulkMarksheets(contract, students, onProgressUpdate);
      setBatchResult(result);
    } catch (error) {
      console.error("Bulk processing failed:", error);
      handleError((error as Error).message || "An unexpected error occurred during file processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  const handleEnrollmentChange = (e: React.ChangeEvent<HTMLInputElement>) => setEnrollmentNumber(e.target.value);
  const handleSemesterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if ((value > 0 && value < 9) || e.target.value === "") {
      setSemester(e.target.value);
      setSubjects([]);
    } else {
      handleError("Semester must be between 1 and 8!");
    }
  };
  const handleSubjectChange = (index: number, value: string) => {
    const isDuplicate = subjects.some((s, i) => i !== index && s.name.trim().toLowerCase() === value.trim().toLowerCase());
    if (isDuplicate) return handleError(`"${value}" is already added`);
    const updated = [...subjects];
    updated[index].name = value;
    setSubjects(updated);
  };
  const handleMarksChange = (index: number, value: string) => {
    if (/^\d*$/.test(value) && Number(value) <= 100) {
      const updated = [...subjects];
      updated[index].marks = value;
      setSubjects(updated);
    } else if (Number(value) > 100) {
      handleError("Marks cannot be greater than 100");
    }
  };
  function getGrade(marks: number): string {
    if (marks >= 80) return "O";
    if (marks >= 70) return "A+";
    if (marks >= 60) return "A";
    if (marks >= 55) return "B+";
    if (marks >= 50) return "B";
    if (marks >= 45) return "C";
    if (marks >= 40) return "P";
    return "F";
  }
  const addSubject = () => {
    if (!semester) return handleError("Please select a semester first");
    if (subjects.length < 5) setSubjects([...subjects, { name: "", marks: "" }]);
    else handleError("You can add exactly 5 subjects");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return handleError("Blockchain connection not available. Please connect your wallet.");
    if (!name.trim() || !enrollmentNumber.trim() || !semester || subjects.length !== 5 || subjects.some((s) => !s.name.trim() || !s.marks.trim())) {
      return handleError("Please fill out all fields and add exactly 5 subjects.");
    }
    if (new Set(subjects.map((s) => s.name.trim().toLowerCase())).size !== subjects.length) {
      return handleError("Duplicate subjects found. Please remove duplicates.");
    }

    try {
      handleSuccess("Submitting... Please wait.");

      const blockchainSuccess = await storeMarksheetHashOnBlockchain(contract, enrollmentNumber, semester, subjects);
      if (!blockchainSuccess) return handleError("Failed to store hash on blockchain. Please try again.");

      const studentDataForPdf = {
        name: name.trim(),
        enrollmentNumber: enrollmentNumber.trim(),
        semester: semester,
        subjects: subjects.map((s) => ({
          name: s.name.trim(),
          grade: getGrade(Number(s.marks)),
        })),
      };

      // Sync with MongoDB backend so the verifier app can fetch it
      const marksObj: Record<string, string> = {};
      subjects.forEach((s) => {
        marksObj[s.name.trim()] = String(s.marks);
      });

      const studentForDb: StudentData = {
        name: name.trim(),
        enrollmentNumber: enrollmentNumber.trim(),
        semester: semester,
        marks: marksObj,
      };
      
      await syncWithDatabase(studentForDb);
      const gradePoints = { O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, P: 4, F: 0 };
      const totalGradePoints = studentDataForPdf.subjects.reduce(
        (total, s) => total + (gradePoints[s.grade as keyof typeof gradePoints] || 0), 0
      );
      const sgpa = (totalGradePoints / studentDataForPdf.subjects.length).toFixed(2);

      localStorage.setItem("studentData", JSON.stringify(studentDataForPdf));
      localStorage.setItem("sgpa", sgpa);
      const hash = generateMarksheetHash(marksObj);
      const verifierUrl = import.meta.env.VITE_VERIFIER_URL || "http://localhost:5176";
      const qrCodeData = `${verifierUrl}/verify/${enrollmentNumber.trim()}/${semester}?hash=${hash}`;
      localStorage.setItem("qrCodeData", qrCodeData);

      handleSuccess("Marksheet generated successfully!");
      navigate("/marksheet");
    } catch (error) {
      console.error("Error in submission process:", error);
      handleError((error as Error).message || "An unexpected error occurred.");
    }
  };

  /* ---- Shared input style ---- */
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "0.9rem",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "none" as const,
  };

  const progressPct = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-primary)", display: "flex" }}>
      {/* ---- SIDEBAR ---- */}
      <aside style={{
        width: "240px",
        flexShrink: 0,
        background: "rgba(255,255,255,0.025)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        padding: "32px 20px",
        gap: "8px",
      }}>
        {/* User info */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "16px", marginBottom: "24px",
          background: "rgba(99,102,241,0.08)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: "14px",
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "1rem", color: "white", flexShrink: 0,
          }}>
            {loggedInUser?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {loggedInUser ?? "Faculty"}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Faculty Admin</div>
          </div>
        </div>

        {/* Nav items */}
        {[
          {
            icon: (
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ),
            label: "Generate Marksheet",
            active: true,
          },
          {
            icon: (
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ),
            label: "Verify",
            active: false,
            href: "/verify",
          },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href ?? "#"}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 14px",
              borderRadius: "10px",
              color: item.active ? "#818cf8" : "#64748b",
              background: item.active ? "rgba(99,102,241,0.1)" : "transparent",
              border: item.active ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
              textDecoration: "none",
              fontWeight: item.active ? 600 : 500,
              fontSize: "0.875rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!item.active) {
                e.currentTarget.style.color = "#94a3b8";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }
            }}
            onMouseLeave={(e) => {
              if (!item.active) {
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {item.icon}
            {item.label}
          </a>
        ))}

        {/* Spacer + blockchain status */}
        <div style={{ marginTop: "auto" }}>
          <div style={{
            padding: "14px",
            background: contract ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${contract ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}`,
            borderRadius: "10px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: contract ? "#34d399" : "#f87171",
                boxShadow: contract ? "0 0 8px #34d399" : "0 0 8px #f87171",
              }} />
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: contract ? "#34d399" : "#f87171" }}>
                {contract ? "Blockchain Ready" : "Wallet Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ---- MAIN CONTENT ---- */}
      <main style={{ flex: 1, padding: "40px 48px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: "6px" }}>
            Generate Marksheet
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Create and store tamper-proof academic records on the Ethereum blockchain.
          </p>
        </div>

        {/* Mode tabs */}
        <div style={{
          display: "inline-flex",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "4px",
          marginBottom: "32px",
          gap: "4px",
        }}>
          {(["single", "bulk"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "9px 24px",
                borderRadius: "9px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.2s ease",
                background: mode === m
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "transparent",
                color: mode === m ? "#fff" : "#64748b",
                boxShadow: mode === m ? "0 4px 16px rgba(99,102,241,0.35)" : "none",
              }}
            >
              {m === "single" ? "Single Entry" : "Bulk Upload"}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "20px",
          padding: "36px 40px",
          maxWidth: "700px",
          boxShadow: "0 4px 40px rgba(0,0,0,0.4)",
        }}>

          {/* ---- SINGLE MODE ---- */}
          {mode === "single" && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <Label>Student Name</Label>
                  <input type="text" value={name} placeholder="Enter full name" onChange={handleNameChange}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                    required />
                </div>
                <div>
                  <Label>Enrollment Number</Label>
                  <input type="text" value={enrollmentNumber} placeholder="I2K123456" onChange={handleEnrollmentChange}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                    required />
                </div>
              </div>

              <div style={{ maxWidth: "200px" }}>
                <Label>Semester (1–8)</Label>
                <input type="number" value={semester} onChange={handleSemesterChange}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                  min="1" max="8" required />
              </div>

              {/* Subjects */}
              {subjects.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 120px",
                    gap: "8px", paddingBottom: "8px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569", letterSpacing: "0.06em" }}>SUBJECT</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569", letterSpacing: "0.06em" }}>MARKS</span>
                  </div>
                  {subjects.map((subject, index) => (
                    <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "8px" }}>
                      <select
                        value={subject.name}
                        onChange={(e) => handleSubjectChange(index, e.target.value)}
                        style={selectStyle}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                        required
                      >
                        <option value="">-- Select --</option>
                        {semester && subjectOptions[semester]?.map((opt) => (
                          <option key={opt} value={opt} style={{ background: "#1e2330" }}>{opt}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={subject.marks}
                        onChange={(e) => handleMarksChange(index, e.target.value)}
                        placeholder="0–100"
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                        min="0" max="100" required
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Add subject button */}
              <button
                type="button"
                onClick={addSubject}
                disabled={subjects.length >= 5}
                style={{
                  padding: "10px 20px",
                  background: subjects.length >= 5 ? "rgba(255,255,255,0.03)" : "rgba(16,185,129,0.1)",
                  border: `1px solid ${subjects.length >= 5 ? "rgba(255,255,255,0.06)" : "rgba(16,185,129,0.3)"}`,
                  borderRadius: "10px",
                  color: subjects.length >= 5 ? "#475569" : "#34d399",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: subjects.length >= 5 ? "not-allowed" : "pointer",
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 0.2s ease",
                  alignSelf: "flex-start",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                Add Subject {subjects.length > 0 ? `(${subjects.length}/5)` : ""}
              </button>

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: "14px", fontSize: "1rem", marginTop: "8px" }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Submit & Store on Blockchain
              </button>
            </form>
          )}

          {/* ---- BULK MODE ---- */}
          {mode === "bulk" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <Label>Upload Excel File</Label>
                <p style={{ fontSize: "0.8rem", color: "#475569", marginBottom: "12px" }}>
                  File must contain columns: <strong style={{ color: "#64748b" }}>"Enrollment Number"</strong> and <strong style={{ color: "#64748b" }}>"Semester"</strong>
                </p>

                {/* Dropzone styling */}
                <label
                  htmlFor="bulk-file-input"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    padding: "40px 24px",
                    background: file ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)",
                    border: `2px dashed ${file ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(99,102,241,0.06)";
                    e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    if (!file) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    }
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: "12px",
                    background: file ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: file ? "#818cf8" : "#475569",
                  }}>
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  {file ? (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 600, color: "#818cf8", fontSize: "0.9rem" }}>{file.name}</div>
                      <div style={{ color: "#64748b", fontSize: "0.78rem", marginTop: "2px" }}>
                        {(file.size / 1024).toFixed(1)} KB · Click to change
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 600, color: "#94a3b8", fontSize: "0.9rem" }}>
                        Click to upload or drag & drop
                      </div>
                      <div style={{ color: "#475569", fontSize: "0.78rem", marginTop: "2px" }}>.xlsx, .xls files only</div>
                    </div>
                  )}
                  <input
                    id="bulk-file-input"
                    type="file"
                    onChange={handleFileChange}
                    accept=".xlsx, .xls"
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              {/* Process button */}
              <button
                onClick={handleBulkSubmit}
                disabled={!file || isProcessing}
                style={{
                  padding: "14px",
                  background: !file || isProcessing
                    ? "rgba(255,255,255,0.06)"
                    : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  border: "none",
                  borderRadius: "12px",
                  color: !file || isProcessing ? "#475569" : "white",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: !file || isProcessing ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 0.25s ease",
                  boxShadow: !file || isProcessing ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
                }}
              >
                {isProcessing ? (
                  <>
                    <svg style={{ animation: "spin 1s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                    </svg>
                    Processing {progress.current}/{progress.total}…
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Upload & Verify on Blockchain
                  </>
                )}
              </button>

              {/* Progress bar */}
              {isProcessing && progress.total > 0 && (
                <div>
                  <div style={{
                    height: "6px",
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: "4px",
                    overflow: "hidden",
                    marginBottom: "8px",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${progressPct}%`,
                      background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                      borderRadius: "4px",
                      transition: "width 0.3s ease",
                      boxShadow: "0 0 12px rgba(99,102,241,0.5)",
                    }} />
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", textAlign: "center" }}>
                    Please do not close this window. This may take a few minutes.
                  </p>
                </div>
              )}

              {/* Batch result */}
              {batchResult && (
                <div style={{
                  padding: "28px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "16px",
                }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#f1f5f9", marginBottom: "20px", textAlign: "center" }}>
                    Processing Complete
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={{
                      padding: "20px",
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.25)",
                      borderRadius: "12px",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: "2rem", fontWeight: 800, color: "#34d399" }}>{batchResult.successful.length}</div>
                      <div style={{ fontSize: "0.8rem", color: "#6ee7b7", fontWeight: 600, marginTop: "4px" }}>Successful</div>
                    </div>
                    <div style={{
                      padding: "20px",
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      borderRadius: "12px",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: "2rem", fontWeight: 800, color: "#f87171" }}>{batchResult.failed.length}</div>
                      <div style={{ fontSize: "0.8rem", color: "#fca5a5", fontWeight: 600, marginTop: "4px" }}>Failed</div>
                    </div>
                  </div>

                  {batchResult.successful.length > 0 && (
                    <div style={{ marginTop: "24px", display: "flex", justifyContent: "center" }}>
                      <button
                        onClick={() => {
                          sessionStorage.setItem("bulkUploadResults", JSON.stringify(batchResult));
                          navigate("/marksheet");
                        }}
                        style={{
                          padding: "12px 24px",
                          background: "linear-gradient(135deg, #10b981, #059669)",
                          border: "none",
                          borderRadius: "10px",
                          color: "white",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          boxShadow: "0 4px 14px rgba(16,185,129,0.3)"
                        }}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        View & Print Marksheets ({batchResult.successful.length})
                      </button>
                    </div>
                  )}

                  {batchResult.failed.length > 0 && (
                    <div style={{ marginTop: "16px" }}>
                      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#f87171", marginBottom: "8px" }}>Failed entries:</p>
                      <ul style={{
                        maxHeight: "140px", overflowY: "auto",
                        padding: "12px 16px",
                        background: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.15)",
                        borderRadius: "10px",
                        listStyle: "none",
                        display: "flex", flexDirection: "column", gap: "5px",
                      }}>
                        {batchResult.failed.map((f, i) => (
                          <li key={i} style={{ fontSize: "0.78rem", color: "#fca5a5" }}>
                            {f.student.enrollmentNumber} (Sem {f.student.semester}): {f.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <ToastContainer />
    </div>
  );
};

export default Home;

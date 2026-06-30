import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { verifyHashFromBlockchain } from "../utils/blockchain";
import { toast } from "react-hot-toast";

interface Subject {
  id: string;
  name: string;
  grade: number;
}

interface SemesterData {
  semester: string;
  subjects: Subject[];
}

export default function VerifyMarksheet() {
  const { enrollmentNumber, semesterNumber } = useParams<{
    enrollmentNumber?: string;
    semesterNumber?: string;
  }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlHash = searchParams.get("hash");

  const [semesterData, setSemesterData] = useState<SemesterData | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /* ---- All original logic PRESERVED unchanged ---- */
  useEffect(() => {
    if (!enrollmentNumber || !semesterNumber) {
      toast.error("Invalid URL parameters");
      setIsVerified(false);
      setLoading(false);
      return;
    }

    async function fetchVerification() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/verify/${enrollmentNumber}/${semesterNumber}`
        );

        if (response.status === 404) {
          toast.error("Record not found");
          setIsVerified(false);
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Before calling blockchain response");

        const blockchainResponse = await verifyHashFromBlockchain(
          String(enrollmentNumber),
          String(semesterNumber),
          String(data.hash)
        );

        console.log("Blockchain Response:", blockchainResponse);

        if (blockchainResponse) {
          if (urlHash && data.hash.toLowerCase() !== urlHash.toLowerCase()) {
            setIsVerified(false);
            toast.error("Document verification failed: URL hash mismatch");
            return;
          }
          setSemesterData(data.semesterData);
          console.log(data.semesterData);
          setIsVerified(true);
          toast.success("Document verified successfully");
        } else {
          setIsVerified(false);
          toast.error("Document verification failed");
        }
      } catch (error) {
        console.error("Error during verification:", error);
        toast.error("Error fetching verification data");
        setIsVerified(false);
      } finally {
        setLoading(false);
      }
    }

    fetchVerification();
  }, [enrollmentNumber, semesterNumber]);

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--color-bg-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
      }}>
        {/* Animated chain icon */}
        <div style={{
          width: 80, height: 80,
          background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
          border: "2px solid rgba(99,102,241,0.3)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "glowPulse 2s ease-in-out infinite",
        }}>
          <svg width="36" height="36" fill="none" stroke="#818cf8" strokeWidth="2" viewBox="0 0 24 24" style={{ animation: "rotateSlow 3s linear infinite" }}>
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#818cf8", fontWeight: 700, fontSize: "1.1rem" }}>Verifying on Blockchain…</p>
          <p style={{ color: "#475569", fontSize: "0.85rem", marginTop: "6px" }}>Querying Ethereum network, please wait</p>
        </div>
        {/* Dot loader */}
        <div style={{ display: "flex", gap: "8px" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#6366f1",
              animation: `particleFloat 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  /* ---- Failed / not found state ---- */
  if (!isVerified) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--color-bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
      }}>
        <div style={{
          textAlign: "center",
          maxWidth: "420px",
          padding: "52px 40px",
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "24px",
          boxShadow: "0 8px 40px rgba(239,68,68,0.08)",
        }}>
          <div style={{
            width: 72, height: 72,
            background: "rgba(239,68,68,0.12)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
          }}>
            <svg width="32" height="32" fill="none" stroke="#f87171" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#f87171", marginBottom: "12px" }}>
            Verification Failed
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.7 }}>
            This document could not be verified on the blockchain. It may have been modified or the record does not exist.
          </p>
          <div style={{
            marginTop: "28px", padding: "14px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.15)",
            borderRadius: "10px",
          }}>
            <p style={{ fontSize: "0.8rem", color: "#fca5a5", fontWeight: 500 }}>
              Enrollment: <strong>{enrollmentNumber ?? "—"}</strong> · Semester: <strong>{semesterNumber ?? "—"}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Success state ---- */
  const gradeColorMap: Record<string, string> = {
    O: "#34d399", "A+": "#818cf8", A: "#38bdf8", "B+": "#fb923c",
    B: "#fbbf24", C: "#a3e635", P: "#94a3b8", F: "#f87171",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-bg-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 32px",
    }}>
      <div style={{ width: "100%", maxWidth: "640px" }}>
        {/* Verified badge */}
        <div className="animate-fade-in-up" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
          padding: "16px 28px",
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: "16px",
          marginBottom: "28px",
          boxShadow: "0 4px 24px rgba(16,185,129,0.1)",
        }}>
          <div style={{
            width: 40, height: 40,
            background: "rgba(16,185,129,0.15)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" fill="none" stroke="#34d399" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: "#34d399", fontSize: "1rem" }}>Verified on Ethereum ✓</p>
            <p style={{ color: "#6ee7b7", fontSize: "0.78rem", marginTop: "2px" }}>This document is authentic and unmodified</p>
          </div>
        </div>

        {/* Header card */}
        <div className="animate-fade-in-up delay-100" style={{
          padding: "28px 32px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "20px",
          marginBottom: "20px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: "1.3rem", color: "#f1f5f9", letterSpacing: "-0.02em", marginBottom: "6px" }}>
                Academic Marksheet
              </h1>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <p style={{ fontSize: "0.82rem", color: "#64748b" }}>
                  <span style={{ color: "#94a3b8", fontWeight: 500 }}>Enrollment:</span>{" "}
                  <span style={{ color: "#c084fc", fontWeight: 700 }}>{enrollmentNumber}</span>
                </p>
                <p style={{ fontSize: "0.82rem", color: "#64748b" }}>
                  <span style={{ color: "#94a3b8", fontWeight: 500 }}>Semester:</span>{" "}
                  <span style={{ color: "#818cf8", fontWeight: 700 }}>{semesterNumber}</span>
                </p>
              </div>
            </div>
            <div style={{
              padding: "12px 20px",
              background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: "12px",
              textAlign: "center",
            }}>
              <p style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", marginBottom: "4px" }}>SEMESTER</p>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#818cf8" }}>{semesterData?.semester ?? "—"}</p>
            </div>
          </div>
        </div>

        {/* Subjects table */}
        <div className="animate-fade-in-up delay-200" style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "20px",
          overflow: "hidden",
        }}>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "auto 1fr auto",
            padding: "14px 24px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", letterSpacing: "0.08em" }}>#</span>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", letterSpacing: "0.08em", paddingLeft: "16px" }}>SUBJECT</span>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", letterSpacing: "0.08em" }}>GRADE</span>
          </div>

          {semesterData?.subjects && semesterData.subjects.length > 0 ? (
            semesterData.subjects.map((subject, i) => {
              const gradeStr = String(subject.grade);
              const gradeColor = gradeColorMap[gradeStr] ?? "#94a3b8";
              return (
                <div
                  key={subject.id}
                  style={{
                    display: "grid", gridTemplateColumns: "auto 1fr auto",
                    padding: "16px 24px",
                    alignItems: "center",
                    borderBottom: i < semesterData.subjects.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ width: "28px", fontSize: "0.78rem", color: "#475569", fontWeight: 600 }}>{i + 1}</span>
                  <span style={{ paddingLeft: "16px", color: "#e2e8f0", fontSize: "0.9rem", fontWeight: 500 }}>{subject.name}</span>
                  <span style={{
                    padding: "4px 14px",
                    background: `${gradeColor}18`,
                    border: `1px solid ${gradeColor}35`,
                    borderRadius: "8px",
                    color: gradeColor,
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    letterSpacing: "0.02em",
                  }}>
                    {gradeStr}
                  </span>
                </div>
              );
            })
          ) : (
            <div style={{ padding: "32px", textAlign: "center", color: "#475569" }}>
              No subject data available.
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="animate-fade-in-up delay-300" style={{
          textAlign: "center", color: "#475569", fontSize: "0.78rem", marginTop: "20px",
        }}>
          🔒 Record verified via Ethereum blockchain · Cryptographic hash matched
        </p>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { CONTRACT_ADDRESS, CONTRACT_ABI, PUBLIC_RPC_URL } from "../constants";

interface VerificationResult {
  status: "loading" | "verified" | "failed" | "error";
  message: string;
}

export default function VerifyPage() {
  const { enrollmentNumber, semesterNumber } = useParams<{
    enrollmentNumber?: string;
    semesterNumber?: string;
  }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlHash = searchParams.get("hash");

  const [result, setResult] = useState<VerificationResult>({
    status: "loading",
    message: "Verifying on blockchain…",
  });

  useEffect(() => {
    if (!enrollmentNumber || !semesterNumber) {
      setResult({
        status: "error",
        message: "Missing enrollment number or semester in URL.",
      });
      return;
    }

    async function verify() {
      const enroll = enrollmentNumber!;
      const sem = semesterNumber!;
      try {
        // Step 1: Query blockchain (read-only, no wallet needed)
        const provider = new ethers.JsonRpcProvider(PUBLIC_RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const studentId = `${enroll.trim().toUpperCase()}-${sem.trim()}`;
        const storedHash = await contract.getStoredHash(studentId);

        // Step 3: Compare hashes
        if (storedHash === ethers.ZeroHash) {
          setResult({
            status: "failed",
            message: "No blockchain record exists for this student.",
          });
          return;
        }

        if (!urlHash) {
          setResult({
            status: "failed",
            message: "Missing hash in URL for verification.",
          });
          return;
        }

        if (storedHash.toLowerCase() !== urlHash.toLowerCase()) {
          setResult({
            status: "failed",
            message: "Verification FAILED — QR code hash mismatch. Document may have been tampered with.",
          });
          toast.error("Verification failed!");
          return;
        }

        // Verified!
        setResult({
          status: "verified",
          message: "This document is authentic and verified on the Ethereum blockchain.",
        });
        toast.success("Document verified successfully!");
      } catch (error) {
        console.error("Verification error:", error);
        setResult({
          status: "error",
          message: "An error occurred during verification. Please try again.",
        });
        toast.error("Verification encountered an error.");
      }
    }

    verify();
  }, [enrollmentNumber, semesterNumber]);



  /* ---- LOADING STATE ---- */
  if (result.status === "loading") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0b0f1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "28px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <div style={{
          width: 88, height: 88,
          background: "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.18))",
          border: "2px solid rgba(99,102,241,0.35)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "glowPulse 2s ease-in-out infinite",
        }}>
          <svg width="40" height="40" fill="none" stroke="#818cf8" strokeWidth="2" viewBox="0 0 24 24"
            style={{ animation: "rotateSlow 3s linear infinite" }}>
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#818cf8", fontWeight: 700, fontSize: "1.15rem", marginBottom: "8px" }}>
            Verifying on Blockchain…
          </p>
          <p style={{ color: "#475569", fontSize: "0.85rem" }}>
            Querying Ethereum Sepolia network
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "#6366f1",
              animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  /* ---- FAILED / ERROR STATE ---- */
  if (result.status === "failed" || result.status === "error") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0b0f1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <div style={{
          textAlign: "center",
          maxWidth: "480px",
          width: "100%",
          padding: "52px 40px",
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "28px",
          boxShadow: "0 8px 48px rgba(239,68,68,0.08)",
          animation: "fadeInUp 0.6s ease-out",
        }}>
          <div style={{
            width: 80, height: 80,
            background: "rgba(239,68,68,0.12)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
          }}>
            <svg width="36" height="36" fill="none" stroke="#f87171" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f87171", marginBottom: "14px" }}>
            {result.status === "error" ? "Verification Error" : "Verification Failed"}
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.92rem", lineHeight: 1.7, marginBottom: "24px" }}>
            {result.message}
          </p>
          {enrollmentNumber && (
            <div style={{
              padding: "16px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.15)",
              borderRadius: "12px",
              marginBottom: "0",
            }}>
              <p style={{ fontSize: "0.82rem", color: "#fca5a5", fontWeight: 500 }}>
                Enrollment: <strong style={{ color: "#f87171" }}>{enrollmentNumber}</strong>
                {" · "}
                Semester: <strong style={{ color: "#f87171" }}>{semesterNumber ?? "—"}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---- VERIFIED STATE ---- */
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b0f1a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "660px", animation: "fadeInUp 0.6s ease-out" }}>

        {/* Verified badge */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "14px",
          padding: "18px 32px",
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: "18px",
          marginBottom: "28px",
          boxShadow: "0 4px 28px rgba(16,185,129,0.1)",
        }}>
          <div style={{
            width: 44, height: 44,
            background: "rgba(16,185,129,0.15)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "checkPop 0.5s ease-out",
          }}>
            <svg width="22" height="22" fill="none" stroke="#34d399" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: "#34d399", fontSize: "1.05rem" }}>
              Verified on Ethereum ✓
            </p>
            <p style={{ color: "#6ee7b7", fontSize: "0.78rem", marginTop: "2px" }}>
              {result.message}
            </p>
          </div>
        </div>

        {/* Student info card */}
        <div style={{
          padding: "28px 32px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "20px",
          marginBottom: "20px",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            flexWrap: "wrap", gap: "16px",
          }}>
            <div>
              <h1 style={{
                fontWeight: 800, fontSize: "1.35rem", color: "#f1f5f9",
                letterSpacing: "-0.02em", marginBottom: "12px",
              }}>
                Academic Marksheet
              </h1>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>

                <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  <span style={{ color: "#94a3b8", fontWeight: 500 }}>Enrollment: </span>
                  <span style={{ color: "#c084fc", fontWeight: 700 }}>{enrollmentNumber}</span>
                </p>
                <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  <span style={{ color: "#94a3b8", fontWeight: 500 }}>Semester: </span>
                  <span style={{ color: "#818cf8", fontWeight: 700 }}>{semesterNumber}</span>
                </p>
              </div>
            </div>
            <div style={{
              padding: "14px 24px",
              background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
              border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: "14px",
              textAlign: "center",
            }}>
              <p style={{
                fontSize: "0.72rem", color: "#64748b", fontWeight: 600,
                letterSpacing: "0.08em", marginBottom: "4px",
              }}>
                SEMESTER
              </p>
              <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "#818cf8" }}>
                {semesterNumber}
              </p>
            </div>
          </div>
        </div>



        {/* Footer */}
        <div style={{
          textAlign: "center",
          marginTop: "16px",
        }}>
          <p style={{ color: "#475569", fontSize: "0.78rem" }}>
            🔒 Record verified via Ethereum blockchain · Cryptographic hash matched
          </p>
        </div>
      </div>
    </div>
  );
}

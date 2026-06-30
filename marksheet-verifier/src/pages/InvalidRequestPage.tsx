
export default function InvalidRequestPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b0f1a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        textAlign: "center",
        maxWidth: "480px",
        width: "100%",
        padding: "52px 40px",
        background: "rgba(239, 68, 68, 0.04)",
        border: "1px solid rgba(239, 68, 68, 0.15)",
        borderRadius: "28px",
        boxShadow: "0 8px 48px rgba(239, 68, 68, 0.05)",
      }}>
        <div style={{
          width: 80, height: 80,
          background: "rgba(239, 68, 68, 0.1)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 28px",
          border: "1px solid rgba(239, 68, 68, 0.2)",
        }}>
          <svg width="36" height="36" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 style={{
          fontSize: "1.75rem",
          fontWeight: 800,
          color: "#f87171",
          marginBottom: "16px",
          letterSpacing: "-0.02em",
        }}>
          Access Denied
        </h1>

        <p style={{
          color: "#94a3b8",
          fontSize: "0.95rem",
          lineHeight: 1.6,
          marginBottom: "12px",
        }}>
          This verifier application is secure and cannot be accessed directly.
        </p>

        <p style={{
          color: "#64748b",
          fontSize: "0.85rem",
          lineHeight: 1.5,
        }}>
          Please scan the QR code printed on an official marksheet.
        </p>
      </div>
    </div>
  );
}

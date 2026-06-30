import { Routes, Route, useParams, useLocation } from "react-router-dom";
import VerifyPage from "./pages/VerifyPage";
import InvalidRequestPage from "./pages/InvalidRequestPage";

function VerifyRouteWrapper() {
  const { enrollmentNumber, semesterNumber } = useParams<{
    enrollmentNumber?: string;
    semesterNumber?: string;
  }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const hash = searchParams.get("hash");

  if (!enrollmentNumber || !semesterNumber || !hash) {
    return <InvalidRequestPage />;
  }

  return <VerifyPage />;
}

function App() {
  return (
    <Routes>
      <Route
        path="/verify/:enrollmentNumber/:semesterNumber"
        element={<VerifyRouteWrapper />}
      />
      <Route path="*" element={<InvalidRequestPage />} />
    </Routes>
  );
}

export default App;


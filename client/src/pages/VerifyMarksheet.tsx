import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

  const [semesterData, setSemesterData] = useState<SemesterData | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
          `${
            import.meta.env.VITE_BACKEND_URL
          }/verify/${enrollmentNumber}/${semesterNumber}`
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
          String(semesterNumber), // Ensure semesterNumber is a string
          String(data.hash)
        );

        console.log("Blockchain Response:", blockchainResponse);

        if (blockchainResponse) {
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

  if (loading) {
    return <p className="text-center text-gray-600">Loading...</p>;
  }

  if (!isVerified) {
    return (
      <p className="text-center text-red-500 font-bold">
        Document not verified or record not found
      </p>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Semester Data for Enrollment Number : {enrollmentNumber}
        <br /> Semester Number : {semesterNumber}
      </h1>

      {/* Render semesterData in a table */}
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Subject</th>
            <th className="border p-2">Grade</th>
          </tr>
        </thead>
        <tbody>
          {semesterData?.subjects ? (
            semesterData?.subjects.map((subject) => (
              <tr key={subject.id} className="text-center">
                <td className="border p-2">{subject.name}</td>
                <td className="border p-2">{subject.grade}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border p-2 text-center" colSpan={2}>
                No subject data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

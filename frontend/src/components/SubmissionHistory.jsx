import { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";

/* ================= COMPONENT ================= */
function SubmissionHistory({ problemId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  /* ---------------- FETCH SUBMISSIONS ---------------- */
  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await axiosClient.get(
          `/problem/submittedProblem/${problemId}`
        );
        setSubmissions(data || []);
      } catch (err) {
        console.error("Failed to fetch submissions", err);
        setSubmissions([]);
        setError("Failed to fetch submission history");
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchSubmissions();
    }
  }, [problemId]);

  /* ---------------- HELPERS ---------------- */
  const getStatusColor = (status = "") => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "badge-success";
      case "wrong":
      case "failed":
        return "badge-error";
      case "error":
        return "badge-warning";
      case "pending":
        return "badge-info";
      default:
        return "badge-neutral";
    }
  };

  const formatMemory = (memory = 0) =>
    memory < 1024
      ? `${memory} kB`
      : `${(memory / 1024).toFixed(2)} MB`;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString();

  /* ---------------- STATES ---------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error bg-base-100/60 backdrop-blur border border-error/30">
        <span>{error}</span>
      </div>
    );
  }

  /* ---------------- RENDER ---------------- */
  return (
    <div className="bg-base-100/50 backdrop-blur border border-base-content/10 rounded-xl p-5">
      <h2 className="text-xl font-semibold mb-4 text-success">
        Submission History
      </h2>

      {/* EMPTY STATE */}
      {submissions.length === 0 ? (
        <div className="text-center py-12 text-base-content/60">
          <p className="text-lg font-medium">
            No submissions yet
          </p>
          <p className="text-sm mt-1">
            Submit your solution to see history here.
          </p>
        </div>
      ) : (
        <>
          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead className="bg-base-200/60">
                <tr>
                  <th>#</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Runtime</th>
                  <th>Memory</th>
                  <th>Tests</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {submissions.map((sub, index) => (
                  <tr
                    key={sub._id}
                    className="hover:bg-base-200/40 transition"
                  >
                    <td>{index + 1}</td>

                    <td className="font-mono text-sm">
                      {sub.language}
                    </td>

                    <td>
                      <span
                        className={`badge badge-sm ${getStatusColor(
                          sub.status
                        )}`}
                      >
                        {sub.status}
                      </span>
                    </td>

                    <td className="font-mono text-sm">
                      {sub.runtime}s
                    </td>

                    <td className="font-mono text-sm">
                      {formatMemory(sub.memory)}
                    </td>

                    <td className="font-mono text-sm">
                      {sub.testCasesPassed}/
                      {sub.testCasesTotal}
                    </td>

                    <td className="text-sm">
                      {formatDate(sub.createdAt)}
                    </td>

                    <td>
                      <button
                        className={`btn btn-sm rounded-full px-4 gap-1 transition-all
                        ${
                          selectedSubmission?._id === sub._id
                            ? "bg-emerald-600/90 text-white border border-emerald-500 shadow-md"
                            : "btn-outline text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10"
                        }`}
                        onClick={() =>
                          setSelectedSubmission(sub)
                        }
                      >
                        <span className="font-mono text-xs">
                          {"</>"}
                        </span>
                        View Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-base-content/50">
            Showing {submissions.length} submissions
          </p>
        </>
      )}

      {/* ================= CODE MODAL ================= */}
      {selectedSubmission && (
        <div className="modal modal-open">
          <div className="modal-box max-w-5xl bg-base-100/90 backdrop-blur border border-base-content/10">
            <h3 className="font-bold text-lg mb-3">
              Submission – {selectedSubmission.language}
            </h3>

            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={`badge ${getStatusColor(
                  selectedSubmission.status
                )}`}
              >
                {selectedSubmission.status}
              </span>
              <span className="badge badge-outline">
                Runtime: {selectedSubmission.runtime}s
              </span>
              <span className="badge badge-outline">
                Memory:{" "}
                {formatMemory(selectedSubmission.memory)}
              </span>
              <span className="badge badge-outline">
                Passed:{" "}
                {selectedSubmission.testCasesPassed}/
                {selectedSubmission.testCasesTotal}
              </span>
            </div>

            {selectedSubmission.errorMessage && (
              <div className="alert alert-error mb-3">
                <span>
                  {selectedSubmission.errorMessage}
                </span>
              </div>
            )}

            <pre className="bg-neutral text-neutral-content p-4 rounded-lg text-sm overflow-x-auto max-h-[60vh]">
              <code>{selectedSubmission.code}</code>
            </pre>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() =>
                  setSelectedSubmission(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubmissionHistory;

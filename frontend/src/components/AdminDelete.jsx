import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";

/* ---------- HELPER ---------- */
const getDifficultyBadge = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "badge-success";
    case "medium":
      return "badge-warning";
    case "hard":
      return "badge-error";
    default:
      return "badge-neutral";
  }
};

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/problem/getAllProblem");
      setProblems(data);
    } catch (err) {
      setError("Failed to fetch problems");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this problem?"))
      return;

    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      setProblems((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError("Failed to delete problem");
      console.error(err);
    }
  };

  /* ---------- STATES ---------- */

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error bg-base-100/60 backdrop-blur border border-error/30 my-4">
        <span>{error}</span>
      </div>
    );
  }

  /* ---------- RENDER ---------- */

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-error">
          Delete Problems
        </h1>
        <p className="text-sm text-base-content/60">
          Permanently remove problems from the platform
        </p>
      </div>

      {/* TABLE CARD */}
      <div className="bg-base-100/50 backdrop-blur border border-base-content/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead className="bg-base-200/60">
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Tags</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {problems.map((problem, index) => (
                <tr
                  key={problem._id}
                  className="hover:bg-base-200/40 transition"
                >
                  <td>{index + 1}</td>

                  <td className="font-medium">
                    {problem.title}
                  </td>

                  <td>
                    <span
                      className={`badge badge-sm ${getDifficultyBadge(
                        problem.difficulty
                      )}`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>

                  <td>
                    <span className="badge badge-outline badge-sm">
                      {problem.tags}
                    </span>
                  </td>

                  <td className="text-right">
                    <button
                      onClick={() => handleDelete(problem._id)}
                      className="btn btn-sm rounded-full px-4
                                 bg-red-600/90 text-white
                                 hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {problems.length === 0 && (
          <div className="text-center py-12 text-base-content/60">
            No problems found
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDelete;

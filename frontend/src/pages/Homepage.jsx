import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { logoutUser } from "../authSlice";

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: "all",
    tag: "all",
    status: "all",
  });

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  /* ================= FETCH PROBLEMS ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !isAuthenticated) return;

    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/getAllProblem");
        setProblems(data);
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get(
          "/problem/problemSolvedByUser"
        );
        setSolvedProblems(data);
      } catch (error) {
        console.error("Error fetching solved problems:", error);
      }
    };

    fetchProblems();
    fetchSolvedProblems();
  }, [isAuthenticated]);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
    navigate("/login");
  };

  /* ================= FILTER ================= */
  const filteredProblems = problems.filter((problem) => {
    const difficultyMatch =
      filters.difficulty === "all" ||
      problem.difficulty === filters.difficulty;

    const tagMatch =
      filters.tag === "all" || problem.tags === filters.tag;

    const statusMatch =
      filters.status === "all" ||
      solvedProblems.some((sp) => sp._id === problem._id);

    return difficultyMatch && tagMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-base-200">
      {/* ================= NAVBAR ================= */}
      <nav className="navbar bg-base-300 sticky top-0 z-50 border-b border-base-content/10">
        <div className="flex-1">
          <NavLink
            to="/"
            className="btn btn-ghost text-xl font-bold text-success tracking-wide"
          >
            🌲 XCODE
          </NavLink>
        </div>

        <div className="flex-none gap-3">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              className="btn btn-sm btn-outline btn-success"
            >
              {user?.firstName}
            </div>

            <ul
              tabIndex={0}
              className="dropdown-content mt-2 menu p-2 shadow bg-base-100 rounded-box w-48"
            >
              {user?.role === "admin" && (
                <li>
                  <NavLink to="/admin">Admin</NavLink>
                </li>
              )}
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* ================= MAIN ================= */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ================= FILTERS ================= */}
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <select
                className="select select-sm select-bordered"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="all">All Problems</option>
                <option value="solved">Solved</option>
              </select>

              <select
                className="select select-sm select-bordered"
                value={filters.difficulty}
                onChange={(e) =>
                  setFilters({ ...filters, difficulty: e.target.value })
                }
              >
                <option value="all">All Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select
                className="select select-sm select-bordered"
                value={filters.tag}
                onChange={(e) =>
                  setFilters({ ...filters, tag: e.target.value })
                }
              >
                <option value="all">All Tags</option>
                <option value="array">Array</option>
                <option value="linkedList">Linked List</option>
                <option value="graph">Graph</option>
                <option value="dp">DP</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= PROBLEM LIST ================= */}
        <div className="space-y-2">
          {filteredProblems.map((problem) => (
            <div
              key={problem._id}
              className="card bg-base-100 border border-base-content/10 hover:bg-base-200 transition-all"
            >
              <div className="card-body py-4 px-5">
                <div className="flex justify-between items-center">
                  <div>
                    <NavLink
                      to={`/problem/${problem._id}`}
                      className="font-semibold text-lg hover:text-success"
                    >
                      {problem.title}
                    </NavLink>

                    <div className="flex gap-2 mt-2">
                      <span
                        className={`badge badge-sm ${getDifficultyBadgeColor(
                          problem.difficulty
                        )}`}
                      >
                        {problem.difficulty}
                      </span>

                      <span className="badge badge-sm badge-outline">
                        {problem.tags}
                      </span>
                    </div>
                  </div>

                  {solvedProblems.some(
                    (sp) => sp._id === problem._id
                  ) && (
                    <span className="badge badge-success gap-1">
                      ✓ Solved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredProblems.length === 0 && (
            <div className="text-center text-base-content/60 py-10">
              No problems found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */
const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
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

export default Homepage;

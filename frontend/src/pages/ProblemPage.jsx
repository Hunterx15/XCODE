import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Editor from "@monaco-editor/react";
import { useParams, useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from "../components/ChatAi";
import Editorial from "../components/Editorial";

/* ---------------- LANGUAGE MAP ---------------- */
const langMap = {
  cpp: "C++",
  java: "Java",
  javascript: "JavaScript",
};

/* ---------------- SAFE HELPER ---------------- */
const getInitialCode = (problemData, language) => {
  if (!problemData?.startCode?.length) return "";
  const lang = langMap[language];
  return (
    problemData.startCode.find(sc => sc.language === lang)?.initialCode ||
    problemData.startCode[0]?.initialCode ||
    ""
  );
};

const getDifficultyBadge = d =>
  d === "easy"
    ? "badge-success"
    : d === "medium"
    ? "badge-warning"
    : "badge-error";

const ProblemPage = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  useForm();

  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [activeRightTab, setActiveRightTab] = useState("code");

  const editorRef = useRef(null);

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  /* ---------------- FETCH PROBLEM ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchProblem = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get(
          `/problem/problemById/${problemId}`
        );
        setProblem(data);
        setCode(getInitialCode(data, selectedLanguage));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId, selectedLanguage]);

  /* ---------------- LANGUAGE CHANGE ---------------- */
  useEffect(() => {
    if (problem) {
      setCode(getInitialCode(problem, selectedLanguage));
    }
  }, [selectedLanguage, problem]);

  /* ---------------- RUN ---------------- */
  const handleRun = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setRunResult(null);
    try {
      const { data } = await axiosClient.post(
        `/submission/run/${problemId}`,
        { code, language: selectedLanguage }
      );
      setRunResult(data);
      setActiveRightTab("testcase");
    } catch {
      setRunResult({ error: "Execution failed" });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmitCode = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setSubmitResult(null);
    try {
      const { data } = await axiosClient.post(
        `/submission/submit/${problemId}`,
        { code, language: selectedLanguage }
      );
      setSubmitResult(data);
      setActiveRightTab("result");
    } catch {
      setSubmitResult({ error: "Submission failed" });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FAIL SAFE ---------------- */
  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex justify-center items-center min-h-screen text-error">
        Failed to load problem
      </div>
    );
  }

  /* ---------------- RENDER ---------------- */
  return (
    <div className="h-screen bg-base-200/80 flex gap-3 p-3">

      {/* ================= LEFT PANEL ================= */}
      <div className="w-1/2 bg-base-100/50 backdrop-blur border rounded-xl flex flex-col overflow-hidden">
        <div className="tabs tabs-boxed bg-base-200/60 p-2">
          {["description", "editorial", "solutions", "submissions", "chatAI"].map(tab => (
            <button
              key={tab}
              className={`tab ${activeLeftTab === tab ? "tab-active" : ""}`}
              onClick={() => setActiveLeftTab(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {activeLeftTab === "description" && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold text-success">
                  {problem.title}
                </h1>
                <span className={`badge ${getDifficultyBadge(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>

              <pre className="whitespace-pre-wrap text-sm text-base-content/80">
                {problem.description}
              </pre>

              <h3 className="mt-6 font-semibold">Examples</h3>
              {problem.visibleTestCases?.map((ex, i) => (
                <div
                  key={i}
                  className="bg-base-200/60 border p-3 rounded-lg mt-2 text-sm"
                >
                  <div><b>Input:</b> {ex.input}</div>
                  <div><b>Output:</b> {ex.output}</div>
                  {ex.explanation && (
                    <div className="text-base-content/70">
                      <b>Explanation:</b> {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {activeLeftTab === "editorial" && (
            <Editorial
              secureUrl={problem.secureUrl}
              thumbnailUrl={problem.thumbnailUrl}
              duration={problem.duration}
            />
          )}

          {activeLeftTab === "solutions" && (
            problem.referenceSolution?.length ? (
              problem.referenceSolution.map((sol, i) => (
                <pre
                  key={i}
                  className="bg-base-200/60 border p-4 rounded-lg mb-3 text-sm overflow-x-auto"
                >
                  {sol.completeCode}
                </pre>
              ))
            ) : (
              <p className="text-base-content/60">
                Solve the problem to unlock solutions.
              </p>
            )
          )}

          {activeLeftTab === "submissions" && (
            <SubmissionHistory problemId={problemId} />
          )}

          {activeLeftTab === "chatAI" && <ChatAi problem={problem} />}
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="w-1/2 bg-base-100/50 backdrop-blur border rounded-xl flex flex-col overflow-hidden">
        <div className="tabs tabs-boxed bg-base-200/60 p-2">
          {["code", "testcase", "result"].map(tab => (
            <button
              key={tab}
              className={`tab ${activeRightTab === tab ? "tab-active" : ""}`}
              onClick={() => setActiveRightTab(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {activeRightTab === "code" && (
          <>
            <div className="p-3 flex gap-2">
              {["javascript", "java", "cpp"].map(lang => (
                <button
                  key={lang}
                  className={`btn btn-sm ${
                    selectedLanguage === lang ? "btn-success" : "btn-ghost"
                  }`}
                  onClick={() => setSelectedLanguage(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="flex-1">
              <Editor
                height="100%"
                theme="vs-dark"
                language={selectedLanguage}
                value={code}
                onChange={v => setCode(v || "")}
                onMount={editor => (editorRef.current = editor)}
              />
            </div>

            <div className="p-3 flex justify-end gap-2">
              <button className="btn btn-outline btn-sm" onClick={handleRun}>
                Run
              </button>
              <button className="btn btn-success btn-sm" onClick={handleSubmitCode}>
                Submit
              </button>
            </div>
          </>
        )}

        {activeRightTab === "testcase" && runResult && (
          <div className="flex-1 p-4 overflow-y-auto">
            <pre className="text-sm">{JSON.stringify(runResult, null, 2)}</pre>
          </div>
        )}

        {activeRightTab === "result" && submitResult && (
          <div className="flex-1 p-4 overflow-y-auto">
            <pre className="text-sm">{JSON.stringify(submitResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemPage;

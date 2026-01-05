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

/* ---------------- HELPERS ---------------- */
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

/* ---------------- FORMATTERS ---------------- */
const formatRunResult = data => ({
  success: data.success,
  runtime: data.runtime,
  memory: data.memory,
  testCases: data.testCases.map((t, i) => ({
    id: i + 1,
    input: t.stdin,
    expected: t.expected_output,
    output: t.stdout,
    status: t.status_id === 3 ? "Accepted" : "Failed",
  })),
});

const formatSubmitResult = data => ({
  accepted: data.accepted,
  passed: data.passedTestCases,
  total: data.totalTestCases,
  runtime: data.runtime,
  memory: data.memory,
});

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
    if (!localStorage.getItem("token")) navigate("/login");
  }, [navigate]);

  /* ---------------- FETCH PROBLEM ---------------- */
  useEffect(() => {
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
  }, [problemId]);

  /* ---------------- LANGUAGE CHANGE ---------------- */
  useEffect(() => {
    if (problem) {
      setCode(getInitialCode(problem, selectedLanguage));
    }
  }, [selectedLanguage, problem]);

  /* ---------------- RUN ---------------- */
  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const { data } = await axiosClient.post(
        `/submission/run/${problemId}`,
        { code, language: selectedLanguage }
      );
      setRunResult(formatRunResult(data));
      setActiveRightTab("testcase");
    } catch {
      setRunResult({ error: true });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
      const { data } = await axiosClient.post(
        `/submission/submit/${problemId}`,
        { code, language: selectedLanguage }
      );
      setSubmitResult(formatSubmitResult(data));
      setActiveRightTab("result");
    } catch {
      setSubmitResult({ error: true });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="h-screen bg-base-200/80 flex gap-3 p-3">

      {/* ================= LEFT PANEL ================= */}
      <div className="w-1/2 bg-base-100 border rounded-xl flex flex-col overflow-hidden">
        <div className="tabs tabs-boxed p-2">
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

          {/* DESCRIPTION */}
          {activeLeftTab === "description" && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold">{problem.title}</h1>
                <span className={`badge ${getDifficultyBadge(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>

              <pre className="whitespace-pre-wrap text-sm">
                {problem.description}
              </pre>

              <h3 className="mt-6 font-semibold">Examples</h3>
              {problem.visibleTestCases?.map((ex, i) => (
                <div
                  key={i}
                  className="bg-base-200 border p-3 rounded-lg mt-2 text-sm"
                >
                  <div><b>Input:</b> {ex.input}</div>
                  <div><b>Output:</b> {ex.output}</div>
                  {ex.explanation && (
                    <div className="opacity-70">
                      <b>Explanation:</b> {ex.explanation}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* EDITORIAL */}
          {activeLeftTab === "editorial" && (
            <Editorial
              secureUrl={problem.secureUrl}
              thumbnailUrl={problem.thumbnailUrl}
              duration={problem.duration}
            />
          )}

          {/* SOLUTIONS */}
          {activeLeftTab === "solutions" && (
            problem.referenceSolution?.length ? (
              problem.referenceSolution.map((sol, i) => (
                <pre
                  key={i}
                  className="bg-base-200 border p-4 rounded-lg mb-3 text-sm overflow-x-auto"
                >
                  {sol.completeCode}
                </pre>
              ))
            ) : (
              <p className="opacity-60">
                Solve the problem to unlock solutions.
              </p>
            )
          )}

          {/* SUBMISSIONS */}
          {activeLeftTab === "submissions" && (
            <SubmissionHistory problemId={problemId} />
          )}

          {/* CHAT AI */}
          {activeLeftTab === "chatAI" && <ChatAi problem={problem} />}
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="w-1/2 bg-base-100 border rounded-xl flex flex-col overflow-hidden">
        <div className="tabs tabs-boxed p-2">
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

        {/* CODE */}
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

            <Editor
              height="100%"
              theme="vs-dark"
              language={selectedLanguage}
              value={code}
              onChange={v => setCode(v || "")}
              onMount={editor => (editorRef.current = editor)}
            />

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

        {/* RUN RESULT */}
        {activeRightTab === "testcase" && runResult && (
          <div className="p-4 space-y-3 overflow-y-auto">
            <h2 className={`text-lg font-bold ${
              runResult.success ? "text-success" : "text-error"
            }`}>
              {runResult.success ? "Accepted" : "Failed"}
            </h2>

            {runResult.testCases.map(tc => (
              <details key={tc.id} className="border rounded p-3">
                <summary className="cursor-pointer flex justify-between">
                  <span>Test Case {tc.id}</span>
                  <span className={tc.status === "Accepted" ? "text-success" : "text-error"}>
                    {tc.status}
                  </span>
                </summary>
                <pre className="mt-2 text-sm">Input: {tc.input}</pre>
                <pre className="text-sm">Expected: {tc.expected}</pre>
                <pre className="text-sm">Output: {tc.output}</pre>
              </details>
            ))}
          </div>
        )}

        {/* SUBMIT RESULT */}
        {activeRightTab === "result" && submitResult && (
          <div className="p-6 space-y-2">
            <h2 className={`text-xl font-bold ${
              submitResult.accepted ? "text-success" : "text-error"
            }`}>
              {submitResult.accepted ? "Accepted 🎉" : "Wrong Answer ❌"}
            </h2>
            <p>Passed: {submitResult.passed} / {submitResult.total}</p>
            <p>Runtime: {submitResult.runtime}s</p>
            <p>Memory: {submitResult.memory} KB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemPage;

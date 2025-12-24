import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Editor from "@monaco-editor/react";
import { useParams } from "react-router";
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

          {/* ---------- DESCRIPTION (RESTORED) ---------- */}
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

              {/* 🔥 EXAMPLES RESTORED */}
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

            {/* 🔥 Bigger editor */}
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

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Test Results</h3>
              {runResult ? (
                <div className={`alert ${runResult.success ? 'alert-success' : 'alert-error'} mb-4`}>
                  <div>
                    {runResult.success ? (
                      <div>
                        <h4 className="font-bold">✅ All test cases passed!</h4>
                        <p className="text-sm mt-2">Runtime: {runResult.runtime+" sec"}</p>
                        <p className="text-sm">Memory: {runResult.memory+" KB"}</p>
                        
                        <div className="mt-4 space-y-2">
                          {runResult.testCases.map((tc, i) => (
                            <div key={i} className="bg-base-100 p-3 rounded text-xs">
                              <div className="font-mono">
                                <div><strong>Input:</strong> {tc.stdin}</div>
                                <div><strong>Expected:</strong> {tc.expected_output}</div>
                                <div><strong>Output:</strong> {tc.stdout}</div>
                                <div className={'text-green-600'}>
                                  {'✓ Passed'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold">❌ Error</h4>
                        <div className="mt-4 space-y-2">
                          {runResult.testCases.map((tc, i) => (
                            <div key={i} className="bg-base-100 p-3 rounded text-xs">
                              <div className="font-mono">
                                <div><strong>Input:</strong> {tc.stdin}</div>
                                <div><strong>Expected:</strong> {tc.expected_output}</div>
                                <div><strong>Output:</strong> {tc.stdout}</div>
                                <div className={tc.status_id==3 ? 'text-green-600' : 'text-red-600'}>
                                  {tc.status_id==3 ? '✓ Passed' : '✗ Failed'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click "Run" to test your code with the example test cases.
                </div>
              )}
            </div>
          )}

        {activeRightTab === 'result' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Submission Result</h3>
              {submitResult ? (
                <div className={`alert ${submitResult.accepted ? 'alert-success' : 'alert-error'}`}>
                  <div>
                    {submitResult.accepted ? (
                      <div>
                        <h4 className="font-bold text-lg">🎉 Accepted</h4>
                        <div className="mt-4 space-y-2">
                          <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                          <p>Runtime: {submitResult.runtime + " sec"}</p>
                          <p>Memory: {submitResult.memory + "KB"} </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-bold text-lg">❌ {submitResult.error}</h4>
                        <div className="mt-4 space-y-2">
                          <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click "Submit" to submit your solution for evaluation.
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default ProblemPage;

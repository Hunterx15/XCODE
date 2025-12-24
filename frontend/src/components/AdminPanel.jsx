import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router";

/* ---------------- SCHEMA ---------------- */
const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.enum(["array", "linkedList", "graph", "dp"]),
  visibleTestCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
        explanation: z.string().min(1, "Explanation is required"),
      })
    )
    .min(1, "At least one visible test case required"),
  hiddenTestCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
      })
    )
    .min(1, "At least one hidden test case required"),
  startCode: z
    .array(
      z.object({
        language: z.enum(["C++", "Java", "JavaScript"]),
        initialCode: z.string().min(1, "Initial code is required"),
      })
    )
    .length(3),
  referenceSolution: z
    .array(
      z.object({
        language: z.enum(["C++", "Java", "JavaScript"]),
        completeCode: z.string().min(1, "Complete code is required"),
      })
    )
    .length(3),
});

function AdminPanel() {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: "C++", initialCode: "" },
        { language: "Java", initialCode: "" },
        { language: "JavaScript", initialCode: "" },
      ],
      referenceSolution: [
        { language: "C++", completeCode: "" },
        { language: "Java", completeCode: "" },
        { language: "JavaScript", completeCode: "" },
      ],
    },
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible,
  } = useFieldArray({ control, name: "visibleTestCases" });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
  } = useFieldArray({ control, name: "hiddenTestCases" });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post("/problem/create", data);
      alert("Problem created successfully!");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* HEADER */}
      <h1 className="text-4xl font-bold text-success mb-8">
        Create New Problem
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* ================= BASIC INFO ================= */}
        <div className="bg-base-100/50 backdrop-blur border border-base-content/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            <input
              {...register("title")}
              placeholder="Problem title"
              className={`input input-bordered w-full ${
                errors.title && "input-error"
              }`}
            />
            {errors.title && (
              <p className="text-error text-sm">{errors.title.message}</p>
            )}

            <textarea
              {...register("description")}
              placeholder="Problem description"
              rows={6}
              className={`textarea textarea-bordered w-full ${
                errors.description && "textarea-error"
              }`}
            />
            {errors.description && (
              <p className="text-error text-sm">
                {errors.description.message}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <select
                {...register("difficulty")}
                className="select select-bordered"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select
                {...register("tags")}
                className="select select-bordered"
              >
                <option value="array">Array</option>
                <option value="linkedList">Linked List</option>
                <option value="graph">Graph</option>
                <option value="dp">DP</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= TEST CASES ================= */}
        <div className="bg-base-100/50 backdrop-blur border border-base-content/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            Test Cases
          </h2>

          {/* Visible */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Visible Test Cases</h3>
              <button
                type="button"
                onClick={() =>
                  appendVisible({ input: "", output: "", explanation: "" })
                }
                className="btn btn-sm rounded-full bg-emerald-600/90 text-white"
              >
                + Add
              </button>
            </div>

            {visibleFields.map((field, index) => (
              <div
                key={field.id}
                className="bg-base-200/60 backdrop-blur border border-base-content/10 rounded-lg p-4 space-y-2"
              >
                <button
                  type="button"
                  onClick={() => removeVisible(index)}
                  className="btn btn-xs btn-error ml-auto block"
                >
                  Remove
                </button>

                <input
                  {...register(`visibleTestCases.${index}.input`)}
                  placeholder="Input"
                  className="input input-bordered w-full"
                />
                <input
                  {...register(`visibleTestCases.${index}.output`)}
                  placeholder="Output"
                  className="input input-bordered w-full"
                />
                <textarea
                  {...register(`visibleTestCases.${index}.explanation`)}
                  placeholder="Explanation"
                  className="textarea textarea-bordered w-full"
                />
              </div>
            ))}
          </div>

          {/* Hidden */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Hidden Test Cases</h3>
              <button
                type="button"
                onClick={() => appendHidden({ input: "", output: "" })}
                className="btn btn-sm rounded-full bg-emerald-600/90 text-white"
              >
                + Add
              </button>
            </div>

            {hiddenFields.map((field, index) => (
              <div
                key={field.id}
                className="bg-base-200/60 backdrop-blur border border-base-content/10 rounded-lg p-4 space-y-2"
              >
                <button
                  type="button"
                  onClick={() => removeHidden(index)}
                  className="btn btn-xs btn-error ml-auto block"
                >
                  Remove
                </button>

                <input
                  {...register(`hiddenTestCases.${index}.input`)}
                  placeholder="Input"
                  className="input input-bordered w-full"
                />
                <input
                  {...register(`hiddenTestCases.${index}.output`)}
                  placeholder="Output"
                  className="input input-bordered w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ================= CODE ================= */}
        <div className="bg-base-100/50 backdrop-blur border border-base-content/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            Code Templates
          </h2>

          {[0, 1, 2].map((index) => (
            <div key={index} className="mb-6">
              <h3 className="font-medium mb-2">
                {index === 0 ? "C++" : index === 1 ? "Java" : "JavaScript"}
              </h3>

              <textarea
                {...register(`startCode.${index}.initialCode`)}
                placeholder="Initial Code"
                rows={5}
                className="textarea textarea-bordered w-full font-mono mb-2"
              />

              <textarea
                {...register(`referenceSolution.${index}.completeCode`)}
                placeholder="Reference Solution"
                rows={5}
                className="textarea textarea-bordered w-full font-mono"
              />
            </div>
          ))}
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          className="btn w-full rounded-full bg-emerald-600/90 text-white hover:bg-emerald-600"
        >
          Create Problem
        </button>
      </form>
    </div>
  );
}

export default AdminPanel;

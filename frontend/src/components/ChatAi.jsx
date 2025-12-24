import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Loader2 } from "lucide-react";

function ChatAi({ problem }) {
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: [{ text: "Hi 👋 How can I help you with this problem?" }]
    }
  ]);

  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  /* ---------- Auto Scroll ---------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ---------- Send Message ---------- */
  const onSubmit = useCallback(
    async (data) => {
      if (loading) return;

      const text = data.message?.trim();
      if (!text) return;

      const userMessage = {
        role: "user",
        parts: [{ text }]
      };

      const updatedMessages = [...messages, userMessage];

      setMessages(updatedMessages);
      reset();
      setLoading(true);

      try {
        const response = await axiosClient.post("/ai/chat", {
          messages: updatedMessages.slice(-20), // prevent token explosion
          title: problem?.title ?? "",
          description: problem?.description ?? "",
          testCases: problem?.visibleTestCases ?? [],
          startCode: problem?.startCode ?? ""
        });

        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            parts: [
              {
                text:
                  response?.data?.message ||
                  "I couldn't generate a response."
              }
            ]
          }
        ]);
      } catch (error) {
        console.error("AI Chat Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            parts: [{ text: "⚠️ Something went wrong. Please try again." }]
          }
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, problem, reset]
  );

  return (
    <div className="flex flex-col h-full max-h-[80vh] min-h-[500px]
                    bg-base-100/50 backdrop-blur
                    border border-base-content/10
                    rounded-xl overflow-hidden">

      {/* ================= CHAT BODY ================= */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap
                ${
                  msg.role === "user"
                    ? "bg-emerald-600/90 text-white rounded-br-sm"
                    : "bg-base-200/70 text-base-content rounded-bl-sm"
                }`}
            >
              {msg.parts[0].text}
            </div>
          </div>
        ))}

        {/* AI Thinking */}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-base-200/70
                            text-sm flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              Thinking…
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ================= INPUT BAR ================= */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border-t border-base-content/10
                   bg-base-100/70 backdrop-blur
                   px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <input
            placeholder="Ask about this problem…"
            className="input input-sm flex-1
                       bg-base-200/60 border border-base-content/10
                       focus:outline-none"
            autoComplete="off"
            disabled={loading}
            {...register("message", {
              required: true,
              minLength: 2,
              maxLength: 500
            })}
          />

          <button
            type="submit"
            disabled={loading || errors.message}
            className={`btn btn-sm rounded-full px-4
              ${
                loading
                  ? "btn-disabled"
                  : "bg-emerald-600/90 text-white hover:bg-emerald-600"
              }`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatAi;

"use client";
import { useState } from "react";
import axios from "axios";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [steps, setSteps] = useState<{ step: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:4000/chat", {

        message,
      });
      console.log("API Response:", res.data); // 👈 check this

      //@ts-ignore
      setSteps(res.data.steps || []);
    } catch (err) {
      console.error(err);
      setSteps([{ step: "ERROR", content: "Error fetching reply 😢" }]);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        Send
      </button>

      <div className="p-3 border rounded-lg bg-gray-50 mt-4">
        {loading ? (
          <p className="text-black">Loading...</p>
        ) : steps.length === 0 ? (
          <p className="text-gray-500">No response yet</p>
        ) : (
          steps.map((s, i) => (
            <div key={i} className="mb-2">
              <span className="font-semibold text-black">{s.step}:</span>
              <pre className="text-black whitespace-pre-wrap">{s.content}</pre>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

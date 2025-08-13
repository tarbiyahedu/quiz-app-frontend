"use client";

import { useState, useEffect } from "react";

interface LeaderboardResult {
  rank: number;
  name: string;
  type: string;
  email?: string;
  mobile?: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
}
import { Button } from "@/components/ui/button";

export default function CompleteQuizResults() {
  const [quizId, setQuizId] = useState("");
  const [results, setResults] = useState<LeaderboardResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (quizId) {
      setLoading(true);
      fetch(`/api/live-leaderboard/quiz/${quizId}/public`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setResults(data.data.leaderboard);
            setError("");
          } else {
            setError(data.message || "Failed to fetch results.");
          }
        })
        .catch(() => setError("Failed to fetch results."))
        .finally(() => setLoading(false));
    }
  }, [quizId]);

  const downloadPDF = () => {
    if (quizId) {
      window.open(`/api/live-leaderboard/${quizId}/export-pdf`, "_blank");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-[#0E2647] text-center">Complete Quiz Results</h2>
      <div className="mb-4 flex flex-col md:flex-row gap-2 items-center justify-center">
        <input
          type="text"
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
          placeholder="Enter Quiz ID"
          className="border px-4 py-2 rounded-lg text-lg w-full md:w-64"
        />
        <Button onClick={downloadPDF} disabled={!quizId} className="bg-[#FAB364] text-[#0E2647] font-semibold rounded-lg px-6 py-2">
          Download PDF
        </Button>
      </div>
      {loading && <div className="text-gray-500 text-center">Loading results...</div>}
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {!loading && !error && results.length > 0 && (
        <ul className="space-y-4">
          {results.map((result, idx) => (
            <li key={idx} className="bg-white rounded-xl shadow p-4">
              <div className="font-bold text-lg text-[#0E2647]">{result.rank}. {result.name} ({result.type})</div>
              <div className="text-gray-700">Score: {result.score} | Correct: {result.correctAnswers}/{result.totalQuestions} | Time: {result.timeTaken}s</div>
              {result.email && <div className="text-gray-500 text-sm">Email: {result.email}</div>}
              {result.mobile && <div className="text-gray-500 text-sm">Mobile: {result.mobile}</div>}
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && results.length === 0 && quizId && (
        <div className="text-gray-500 text-center">No results found for this quiz.</div>
      )}
    </div>
  );
}

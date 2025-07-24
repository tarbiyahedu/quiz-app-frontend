"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { liveQuizAPI } from "@/lib/api";

export default function JoinByCodePage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;
    async function findQuiz() {
      try {
        const res = await liveQuizAPI.getQuizByCode(code);
        const quiz = res.data.data;
        if (quiz && quiz._id) {
          // Redirect to the quiz/[quizId]/live route
          router.replace(`/quiz/${quiz._id}/live`);
        } else {
          setError("Quiz not found or code invalid.");
        }
      } catch (err) {
        setError("Quiz not found or code invalid.");
      }
    }
    findQuiz();
  }, [code, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">404 - Quiz Not Found</h1>
          <p className="text-gray-700">The join code you used is invalid or the quiz does not exist.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-4">Joining Quiz...</h1>
        <p className="text-gray-700">Please wait while we find your quiz.</p>
      </div>
    </div>
  );
} 
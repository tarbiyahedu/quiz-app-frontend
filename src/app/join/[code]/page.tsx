"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { liveQuizAPI } from "@/lib/api";

export default function JoinByCodePage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    async function findQuiz() {
      try {
        setLoading(true);
        console.log('Fetching quiz with code:', code);
        const res = await liveQuizAPI.getQuizByCode(code);
        const quiz = res.data.data;
        console.log('Quiz found:', quiz);
        if (quiz && quiz._id) {
          // Redirect to the public quiz page instead of the authenticated one
          console.log('Redirecting to:', `/quiz/${quiz._id}/live`);
          router.replace(`/quiz/${quiz._id}/live`);
        } else {
          setError("Quiz not found or code invalid.");
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError("Quiz not found or code invalid.");
      } finally {
        setLoading(false);
      }
    }
    findQuiz();
  }, [code, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Joining Quiz...</h1>
          <p className="text-gray-600">Please wait while we find your quiz.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold mb-4 text-red-600">404 - Quiz Not Found</h1>
          <p className="text-gray-700 mb-6">The join code you used is invalid or the quiz does not exist.</p>
          <button 
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return null;
} 
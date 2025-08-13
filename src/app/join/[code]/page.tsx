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
  const [quiz, setQuiz] = useState<any>(null);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: "", contact: "" });
  const [guestError, setGuestError] = useState("");

  useEffect(() => {
    if (!code) return;
    async function findQuiz() {
      try {
        setLoading(true);
        const res = await liveQuizAPI.getQuizByCode(code);
        const quiz = res.data.data;
        if (quiz && quiz._id) {
          setQuiz(quiz);
          setShowGuestForm(true);
        } else {
          setError("Quiz not found or code invalid.");
        }
      } catch (err) {
        setError("Quiz not found or code invalid.");
      } finally {
        setLoading(false);
      }
    }
    findQuiz();
  }, [code]);

  const handleGuestSubmit = async () => {
    setGuestError("");
    if (!guestInfo.name.trim() || !guestInfo.contact.trim()) {
      setGuestError("Name and mobile/email are required.");
      return;
    }
    try {
      const res = await liveQuizAPI.guestJoin({
        quizId: quiz._id,
        name: guestInfo.name,
        contact: guestInfo.contact
      });
      const guestId = res.data.guestId;
      localStorage.setItem("guestId", guestId);
      // Save guest info for later quiz submission
      localStorage.setItem("guestInfo", JSON.stringify({
        guestName: guestInfo.name,
        guestContact: guestInfo.contact
      }));
      // Emit socket event for guest join with role info
      try {
        const io = (await import('socket.io-client')).default;
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'https://quiz-app-backend-pi.vercel.app');
        // const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
        socket.emit('joinPublicQuiz', {
          quizId: quiz._id,
          guestName: guestInfo.name,
          role: 'Guest'
        });
      } catch (e) {}
      router.replace(`/quiz/${quiz._id}/live`);
    } catch (err: any) {
      setGuestError(err?.response?.data?.message || "Failed to join as guest.");
    }
  };

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

  if (showGuestForm && quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold mb-4 text-[#0E2647]">Join as Guest</h1>
          <p className="mb-4 text-gray-700">Enter your name and mobile/email to join the quiz.</p>
          <input
            className="w-full border rounded-lg p-3 mb-4"
            placeholder="Full Name"
            value={guestInfo.name}
            onChange={e => setGuestInfo({ ...guestInfo, name: e.target.value })}
          />
          <input
            className="w-full border rounded-lg p-3 mb-4"
            placeholder="Mobile or Email"
            value={guestInfo.contact}
            onChange={e => setGuestInfo({ ...guestInfo, contact: e.target.value })}
          />
          {guestError && <div className="text-red-500 mb-2">{guestError}</div>}
          <button
            onClick={handleGuestSubmit}
            className="bg-[#0E2647] text-white px-6 py-2 rounded-lg hover:bg-[#FAB364] transition-colors w-full font-semibold"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  return null;
} 
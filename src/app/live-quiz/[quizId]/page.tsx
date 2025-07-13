"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import io from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");

export default function LiveQuizAnswerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLive, setIsLive] = useState(true);
  const [ended, setEnded] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch quiz and questions
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const quizRes = await api.get(`/live-quizzes/${quizId}`);
        setQuiz(quizRes.data.data);
        setIsLive(quizRes.data.data.isLive !== false); // default to true if missing
        const qRes = await api.get(`/live-quiz-questions/quiz/${quizId}`);
        setQuestions(qRes.data.data || []);
      } catch (e) {
        setIsLive(false);
      } finally {
        setPageLoading(false);
      }
    }
    if (user) fetchQuiz();
  }, [quizId, user]);

  // Socket.IO: Listen for live end
  useEffect(() => {
    if (!quizId || !user) return;
    socket.emit("join_live_quiz", { quizId, user: { id: user._id, name: user.name, avatar: user.avatar } });
    socket.on("live_status", ({ live }) => {
      setIsLive(live);
      if (!live) {
        setEnded(true);
        setTimeout(() => router.push(`/live-quiz/${quizId}/overview`), 4000);
      }
    });
    return () => {
      socket.off("live_status");
    };
  }, [quizId, user, router]);

  if (loading || pageLoading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to join the quiz.</div>;
  if (!quiz || !isLive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-2xl font-bold text-red-600 mb-4">Live Time Expired or Quiz Not Available</div>
        <div>Redirecting to overview...</div>
      </div>
    );
  }

  const question = questions[current];

  // Handle answer selection
  const handleSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [question._id]: option }));
  };

  // Navigation
  const next = () => setCurrent((c) => Math.min(c + 1, questions.length - 1));
  const back = () => setCurrent((c) => Math.max(c - 1, 0));

  // Submit all answers
  const handleSubmit = async () => {
    await api.post(`/live-quiz/${quizId}/submit-answer`, {
      answers: Object.entries(answers).map(([questionId, answerText]) => ({ questionId, answerText })),
    });
    router.push('/complete-quiz');
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-500"> {current + 1} of {questions.length} </span>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Live</span>
      </div>
      <div className="text-2xl font-bold text-center mb-6">{question.questionText}</div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {question.options && question.options.map((opt: string, idx: number) => (
          <Button
            key={idx}
            className={`w-full py-4 text-lg ${answers[question._id] === opt ? "bg-blue-500 text-white" : ""}`}
            onClick={() => handleSelect(opt)}
          >
            {String.fromCharCode(65 + idx)}. {opt}
          </Button>
        ))}
      </div>
      <div className="flex justify-between">
        <Button onClick={back} disabled={current === 0}>Back</Button>
        {current < questions.length - 1 ? (
          <Button onClick={next}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== questions.length}>Submit</Button>
        )}
      </div>
      {ended && (
        <div className="mt-6 text-center text-red-600 font-bold">
          Live Time Expired! Redirecting to overview...
        </div>
      )}
    </div>
  );
} 
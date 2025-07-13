'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/auth-context';
import io from "socket.io-client";
import api from "@/lib/api";
import { liveQuizQuestionAPI } from '@/lib/api';
import { useParams } from "next/navigation";
import StudentLayout from "@/app/layouts/student-layout";
import { Badge } from "@/components/ui/badge";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");

export default function LiveQuizPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState<any>("");
  const [submitting, setSubmitting] = useState(false);

  // --- Matching UI state ---
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);
  useEffect(() => {
    const q = questions[current];
    if (q && q.type === 'Match' && Array.isArray(q.matchingPairs) && q.matchingPairs.length > 0) {
      const right = q.matchingPairs.map((pair: any) => pair.itemB);
      // Shuffle right items
      setShuffledRight(right.sort(() => Math.random() - 0.5));
      // Reset answer for this question
      setAnswer(Array(q.matchingPairs.length).fill(''));
    }
     
  }, [current, questions]);

  useEffect(() => {
    if (!user) return; // Wait for user to be loaded
    const fetchQuizAndQuestions = async () => {
      try {
        const res = await api.get(`/live-quizzes/${id}`);
        setQuiz(res.data.data);
        const qRes = await liveQuizQuestionAPI.getQuestionsByQuiz(id);
        setQuestions(qRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch quiz or questions:", err);
        setQuiz(null);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizAndQuestions();
  }, [id, user]);

  useEffect(() => {
    if (!user || !id) return;
    socket.emit('join-quiz', { quizId: id, userId: user._id });
    return () => {
      socket.emit('leave-quiz', { quizId: id, userId: user._id });
    };
  }, [user, id]);

  if (loading) return <StudentLayout><div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading quiz...</p></div></div></StudentLayout>;
  if (!user) return <StudentLayout><div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading user...</p></div></div></StudentLayout>;
  if (!quiz && !loading) {
    return (
      <StudentLayout>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-xl lg:text-2xl font-bold mb-4 text-center">Quiz not found or failed to load.</h1>
        <Button onClick={() => router.push("/dashboard")} className="text-sm lg:text-base">Return to Dashboard</Button>
      </div>
      </StudentLayout>
    );
  }
  if (!questions.length && !loading) {
    return (
      <StudentLayout>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-xl lg:text-2xl font-bold mb-4 text-center">No questions found for this quiz</h1>
        <Button onClick={() => router.push("/dashboard")} className="text-sm lg:text-base">Return to Dashboard</Button>
      </div>
      </StudentLayout>
    );
  }
  const q = questions[current];
  if (!q) return <div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading question...</p></div></div>;

  // Render input based on question type
  function renderInput() {
    switch (q.type) {
      case 'MCQ':
        return (
          <div className="flex flex-col gap-3 mt-4">
            {q.options.map((opt: string, idx: number) => (
              <label key={idx} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="answer"
                  value={opt}
                  checked={answer === opt}
                  onChange={() => setAnswer(opt)}
                  className="h-4 w-4"
                />
                <span className="text-sm lg:text-base">{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'TF':
        return (
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input type="radio" name="answer" value="true" checked={answer === 'true'} onChange={() => setAnswer('true')} className="h-4 w-4" />
              <span className="text-sm lg:text-base">True</span>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input type="radio" name="answer" value="false" checked={answer === 'false'} onChange={() => setAnswer('false')} className="h-4 w-4" />
              <span className="text-sm lg:text-base">False</span>
            </label>
          </div>
        );
      case 'Short':
      case 'Long':
        return (
          <textarea
            className="w-full border rounded-lg p-3 mt-4 text-sm lg:text-base resize-none"
            rows={q.type === 'Long' ? 5 : 3}
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type your answer..."
          />
        );
      case 'Fill':
        return (
          <input
            className="w-full border rounded-lg p-3 mt-4 text-sm lg:text-base"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type your answer..."
          />
        );
      case 'Match': {
        const pairs = Array.isArray(q.matchingPairs) ? q.matchingPairs : [];
        const leftItems = pairs.map((pair: any) => pair.itemA);
        // answer: array of selected right items (itemB) for each left item
        const handleSelect = (idx: number, value: string) => {
          const newAnswer = Array.isArray(answer) ? [...answer] : Array(pairs.length).fill('');
          newAnswer[idx] = value;
          setAnswer(newAnswer);
        };
        return (
          <div className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-semibold mb-3 text-sm lg:text-base">
              <div>Column A</div>
              <div>Column B (Select Match)</div>
            </div>
            {leftItems.map((itemA: string, idx: number) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 items-center">
                <div className="text-sm lg:text-base font-medium">{itemA}</div>
                <select
                  className="border rounded-lg p-2 w-full text-sm lg:text-base"
                  value={Array.isArray(answer) ? answer[idx] || '' : ''}
                  onChange={e => handleSelect(idx, e.target.value)}
                >
                  <option value="">Select...</option>
                  {shuffledRight.map((itemB, j) => (
                    <option key={j} value={itemB}>{itemB}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        );
      }
      case 'Ordering':
        return <div className="mt-4 text-sm lg:text-base">(Ordering UI not implemented)</div>;
      case 'Image':
        return (
          <div className="mt-4">
            {q.imageUrl && <img src={q.imageUrl} alt="Question" className="mb-3 max-w-full h-auto rounded-lg" />}
            <input
              className="w-full border rounded-lg p-3 text-sm lg:text-base"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer..."
            />
          </div>
        );
      case 'Media':
        return <div className="mt-4 text-sm lg:text-base">(Media question UI not implemented)</div>;
      default:
        return null;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      // You may want to add timeTaken, etc.
      await api.post('/live-quiz-answers/submit', {
        quizId: quiz._id,
        questionId: q._id,
        answerText: answer,
        timeTaken: 0 // TODO: implement timer
      });
      
      if (current < questions.length - 1) {
        setCurrent(current + 1);
        setAnswer("");
      } else {
        // Quiz completed
        router.push(`/quiz/${id}/results`);
      }
    } catch (err) {
      console.error("Failed to submit answer:", err);
      alert("Failed to submit answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Quiz Status */}
        <div className="mb-4 lg:mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl lg:text-2xl font-bold text-[#0E2647]">{quiz?.title}</h1>
            <Badge variant={quiz?.isLive ? "default" : "secondary"} className="text-xs lg:text-sm">
              {quiz?.isLive ? "Live" : "Ended"}
            </Badge>
          </div>
          <p className="text-sm lg:text-base text-gray-600">{quiz?.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 lg:mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm lg:text-base font-medium">Question {current + 1} of {questions.length}</span>
            <span className="text-sm lg:text-base text-gray-600">{Math.round(((current + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
            <div 
              className="bg-[#FAB364] h-2 lg:h-3 rounded-full transition-all duration-300" 
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg border shadow-sm p-4 lg:p-6 mb-4 lg:mb-6">
          <div className="mb-4 lg:mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs lg:text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{q.type}</span>
              <span className="text-xs lg:text-sm text-gray-600">{q.marks} marks</span>
            </div>
            <h2 className="text-lg lg:text-xl font-semibold text-[#0E2647] mb-3 lg:mb-4">{q.questionText}</h2>
            {renderInput()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrent(Math.max(0, current - 1))}
              disabled={current === 0}
              className="text-sm lg:text-base"
            >
              Previous
            </Button>
            
            <div className="flex gap-2 lg:gap-3">
              {current < questions.length - 1 ? (
                <Button
                  onClick={() => {
                    setCurrent(current + 1);
                    setAnswer("");
                  }}
                  disabled={!answer}
                  className="text-sm lg:text-base"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!answer || submitting}
                  className="text-sm lg:text-base"
                >
                  {submitting ? "Submitting..." : "Submit Quiz"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quiz not live warning */}
        {!quiz?.isLive && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-sm lg:text-base text-yellow-800">
              This quiz is not currently live. You cannot submit answers at this time.
            </p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
} 
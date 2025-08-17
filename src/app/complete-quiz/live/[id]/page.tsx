'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import io from "socket.io-client";
import api from "@/lib/api";
import { liveQuizAPI, liveQuizQuestionAPI, liveQuizAnswerAPI } from '@/lib/api';
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, ArrowLeft, ArrowRight } from "lucide-react";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");
// const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "https://quiz-app-backend-pi.vercel.app");

export default function PublicLiveQuizPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestError, setGuestError] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestMobile, setGuestMobile] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);

  // --- Matching UI state ---
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);
  
  useEffect(() => {
    const q = questions[current];
    if (q && q.type === 'Match' && Array.isArray(q.matchingPairs) && q.matchingPairs.length > 0) {
      const right = q.matchingPairs.map((pair: any) => pair.itemB);
      // Shuffle right items
      setShuffledRight(right.sort(() => Math.random() - 0.5));
      // Reset answer for this question
      setAnswers(prev => ({ ...prev, [q._id]: Array(q.matchingPairs.length).fill('') }));
    }
  }, [current, questions]);

  useEffect(() => {
    const fetchQuizAndQuestions = async () => {
      try {
        console.log('Fetching public quiz with ID:', id);
        // Fetch quiz details without authentication
        const res = await liveQuizAPI.getPublicQuizById(id);
        console.log('Quiz data received:', res.data.data);
        setQuiz(res.data.data);
        
        // Check if quiz is live
        if (res.data.data.isLive) {
          setQuizStarted(true);
        }
        
        console.log('Fetching questions for quiz:', id);
        const qRes = await liveQuizQuestionAPI.getPublicQuestionsByQuiz(id);
        console.log('Questions received:', qRes.data.data);
        setQuestions(qRes.data.data || []);
        setFetchError(null);
      } catch (err: any) {
        console.error("Failed to fetch quiz or questions:", err);
        setQuiz(null);
        setQuestions([]);
        setFetchError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch quiz or questions. Please check your connection or try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchQuizAndQuestions();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Loading Quiz...</h1>
          <p className="text-gray-600">Please wait while we prepare your quiz.</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error Loading Quiz</h1>
          <p className="mb-6 text-gray-700">{fetchError}</p>
          <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
          <p className="mb-6 text-gray-700">The quiz you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold mb-4">No Questions Available</h1>
          <p className="mb-6 text-gray-700">This quiz doesn't have any questions yet.</p>
          <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  if (!q) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  // Update answer state as user answers each question
  function handleAnswerChange(value: any) {
    setAnswers(prev => ({ ...prev, [q._id]: value }));
  }

  // Render input based on question type
  function renderInput() {
    switch (q.type) {
      case 'MCQ': {
        const isMultiple = Array.isArray(q.correctAnswers) && q.correctAnswers.length > 1;
        if (isMultiple) {
          // Multiple-answer MCQ: use checkboxes
          const selected = Array.isArray(answers[q._id]) ? answers[q._id] : [];
          const handleCheckbox = (opt: string) => {
            if (selected.includes(opt)) {
              handleAnswerChange(selected.filter((o: string) => o !== opt));
            } else {
              handleAnswerChange([...selected, opt]);
            }
          };
          return (
            <div className="flex flex-col gap-3 mt-4">
              {q.options.map((opt: string, idx: number) => (
                <label key={idx} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    name={`answer-${q._id}`}
                    value={opt}
                    checked={selected.includes(opt)}
                    onChange={() => handleCheckbox(opt)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm lg:text-base">{opt}</span>
                </label>
              ))}
            </div>
          );
        } else {
          // Single-answer MCQ: use radio buttons
          return (
            <div className="flex flex-col gap-3 mt-4">
              {q.options.map((opt: string, idx: number) => (
                <label key={idx} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="answer"
                    value={opt}
                    checked={answers[q._id] === opt}
                    onChange={() => handleAnswerChange(opt)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm lg:text-base">{opt}</span>
                </label>
              ))}
            </div>
          );
        }
      }
      case 'TF':
        return (
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input type="radio" name="answer" value="true" checked={answers[q._id] === 'true'} onChange={() => handleAnswerChange('true')} className="h-4 w-4" />
              <span className="text-sm lg:text-base">True</span>
            </label>
            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input type="radio" name="answer" value="false" checked={answers[q._id] === 'false'} onChange={() => handleAnswerChange('false')} className="h-4 w-4" />
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
            value={answers[q._id] || ''}
            onChange={e => handleAnswerChange(e.target.value)}
            placeholder="Type your answer..."
          />
        );
      case 'Fill':
        return (
          <input
            className="w-full border rounded-lg p-3 mt-4 text-sm lg:text-base"
            value={answers[q._id] || ''}
            onChange={e => handleAnswerChange(e.target.value)}
            placeholder="Type your answer..."
          />
        );
      case 'Match': {
        const pairs = Array.isArray(q.matchingPairs) ? q.matchingPairs : [];
        const leftItems = pairs.map((pair: any) => pair.itemA);
        // answer: array of selected right items (itemB) for each left item
        const handleSelect = (idx: number, value: string) => {
          const prev = Array.isArray(answers[q._id]) ? [...answers[q._id]] : Array(pairs.length).fill('');
          prev[idx] = value;
          handleAnswerChange(prev);
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
                  value={Array.isArray(answers[q._id]) ? answers[q._id][idx] || '' : ''}
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
              value={answers[q._id] || ''}
              onChange={e => handleAnswerChange(e.target.value)}
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
      // Always show guest modal for public access
      setShowGuestModal(true);
      setSubmitting(false);
    } catch (err) {
      console.error('Failed to submit answers:', err);
      alert('Failed to submit answers. Please try again.');
      setSubmitting(false);
    }
  }

  async function handleGuestSubmit() {
    setGuestError('');
    if (!guestName.trim() || (!guestEmail.trim() && !guestMobile.trim())) {
      setGuestError('Full Name and at least Email or Mobile are required.');
      return;
    }
    setSubmitting(true);
    try {
      const answersArray = questions.map((question) => {
        const ans = answers[question._id];
        return {
          questionId: question._id,
          answerText: Array.isArray(ans) ? ans : ans || '',
          timeTaken: 0
        };
      });
      await liveQuizAnswerAPI.submitMultipleAnswersGuest({
        quizId: quiz._id,
        answers: answersArray,
        isGuest: true,
        guestName,
        guestEmail,
        guestMobile
      });
      setShowGuestModal(false);
      router.push(`/leaderboard/${quiz._id}`); // Redirect to leaderboard
    } catch (err) {
      setGuestError('Failed to submit answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // If quiz is not live, show waiting message
  if (!quiz.isLive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full mx-4">
          <div className="mb-4">
            <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">{quiz.title}</h1>
          <p className="text-gray-600 mb-4">{quiz.description}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-medium">Quiz Not Started</p>
            <p className="text-yellow-700 text-sm">This quiz is not currently live. Please wait for the administrator to start it.</p>
          </div>
          <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Guest Info Modal */}
      <Dialog open={showGuestModal} onOpenChange={setShowGuestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Your Details to Submit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Full Name (required)"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
            />
            <Input
              placeholder="Email (optional)"
              value={guestEmail}
              onChange={e => setGuestEmail(e.target.value)}
            />
            <Input
              placeholder="Mobile (optional)"
              value={guestMobile}
              onChange={e => setGuestMobile(e.target.value)}
            />
            <div className="text-xs text-gray-500">At least one of Email or Mobile is required.</div>
            {guestError && <div className="text-red-500 text-sm">{guestError}</div>}
            <Button className="w-full" onClick={handleGuestSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Answers'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Quiz Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#0E2647]">{quiz?.title}</h1>
            <Badge variant="default" className="bg-green-600 text-white">
              LIVE
            </Badge>
          </div>
          <p className="text-gray-600 text-lg">{quiz?.description}</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm lg:text-base font-medium">Question {current + 1} of {questions.length}</span>
              <span className="text-sm lg:text-base text-gray-600">{Math.round(((current + 1) / questions.length) * 100)}%</span>
            </div>
            <Progress value={((current + 1) / questions.length) * 100} className="h-3" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs lg:text-sm">{q.type}</Badge>
              <span className="text-xs lg:text-sm text-gray-600">{q.marks} marks</span>
            </div>
            <CardTitle className="text-lg lg:text-xl text-[#0E2647]">{q.questionText}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderInput()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="text-sm lg:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2 lg:gap-3">
            {current < questions.length - 1 ? (
              <Button
                onClick={() => setCurrent(current + 1)}
                disabled={!answers[q._id]}
                className="text-sm lg:text-base"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== questions.length || submitting}
                className="text-sm lg:text-base bg-green-600 hover:bg-green-700"
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
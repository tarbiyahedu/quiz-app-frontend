'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/auth-context';
import api from "@/lib/api";
import { liveQuizAPI, liveQuizQuestionAPI, liveQuizAnswerAPI } from '@/lib/api';
import { useParams } from "next/navigation";
import StudentLayout from "@/app/layouts/student-layout";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function LiveQuizPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, loading: authLoading } = useAuth();
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
        console.log('Fetching quiz with ID:', id);
        console.log('User state:', user);
        console.log('Auth loading:', authLoading);
        
        // Wait for auth to finish loading and ID to be available
        if (authLoading || !id) {
          console.log('Auth still loading or ID not available, waiting...');
          return;
        }
        
        // Use public API for guest users, authenticated API for logged-in users
        let res;
        if (user) {
          console.log('User is authenticated, using authenticated API');
          res = await api.get(`/live-quizzes/${id}`);
        } else {
          console.log('User is not authenticated, using public API');
          res = await liveQuizAPI.getPublicQuizById(id);
        }
        
        setQuiz(res.data.data);
        console.log('Quiz data received:', res.data.data);
        
        // Use public API for questions
        const qRes = await liveQuizQuestionAPI.getPublicQuestionsByQuiz(id);
        console.log('Questions received:', qRes.data.data);
        setQuestions(qRes.data.data || []);
        setFetchError(null);
      } catch (err: any) {
        console.error("Failed to fetch quiz or questions:", err);
        console.error("Error details:", {
          status: err?.response?.status,
          statusText: err?.response?.statusText,
          data: err?.response?.data,
          message: err?.message
        });
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
  }, [id, user, authLoading]);

  // Socket functionality temporarily disabled to fix Socket.IO errors
  // TODO: Re-enable for authenticated users once Socket.IO issues are resolved

  if (loading || authLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading quiz...</p>
      </div>
    </div>
  );
  
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-xl lg:text-2xl font-bold mb-4 text-center text-red-600">Error Loading Quiz</h1>
        <p className="mb-4 text-gray-700 text-center">{fetchError}</p>
        <Button onClick={() => router.push(user ? "/dashboard" : "/")} className="text-sm lg:text-base">
          {user ? "Return to Dashboard" : "Go Home"}
        </Button>
      </div>
    );
  }
  
  if (!quiz && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-xl lg:text-2xl font-bold mb-4 text-center">Quiz not found or failed to load.</h1>
        <Button onClick={() => router.push(user ? "/dashboard" : "/")} className="text-sm lg:text-base">
          {user ? "Return to Dashboard" : "Go Home"}
        </Button>
      </div>
    );
  }
  
  if (!questions.length && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-xl lg:text-2xl font-bold mb-4 text-center">No questions found for this quiz</h1>
        <Button onClick={() => router.push(user ? "/dashboard" : "/")} className="text-sm lg:text-base">
          {user ? "Return to Dashboard" : "Go Home"}
        </Button>
      </div>
    );
  }
  
  const q = questions[current];
  if (!q) return <div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading question...</p></div></div>;

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
            type="text"
            className="w-full border rounded-lg p-3 mt-4 text-sm lg:text-base"
            value={answers[q._id] || ''}
            onChange={e => handleAnswerChange(e.target.value)}
            placeholder="Type your answer..."
          />
        );
      case 'Match':
        return (
          <div className="mt-4 space-y-4">
            {q.matchingPairs.map((pair: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg">
                <span className="text-sm lg:text-base font-medium min-w-[100px]">{pair.itemA}</span>
                <span className="text-sm lg:text-base">→</span>
                <select
                  className="flex-1 border rounded-lg p-2 text-sm lg:text-base"
                  value={answers[q._id]?.[idx] || ''}
                  onChange={(e) => {
                    const newAnswers = [...(answers[q._id] || Array(q.matchingPairs.length).fill(''))];
                    newAnswers[idx] = e.target.value;
                    handleAnswerChange(newAnswers);
                  }}
                >
                  <option value="">Select answer</option>
                  {shuffledRight.map((rightItem, rightIdx) => (
                    <option key={rightIdx} value={rightItem}>
                      {rightItem}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <textarea
            className="w-full border rounded-lg p-3 mt-4 text-sm lg:text-base resize-none"
            rows={3}
            value={answers[q._id] || ''}
            onChange={e => handleAnswerChange(e.target.value)}
            placeholder="Type your answer..."
          />
        );
    }
  }

  async function handleSubmit() {
    if (!user) {
      setShowGuestModal(true);
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

      await api.post('/live-quiz-answers/submit-multiple', {
        quizId: quiz._id,
        answers: answersArray,
      });

      router.push(`/leaderboard/${quiz._id}`);
    } catch (err) {
      console.error('Failed to submit answers:', err);
      alert('Failed to submit answers. Please try again.');
    } finally {
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
      router.push(`/leaderboard/${quiz._id}`); // or Thank You page
    } catch (err) {
      setGuestError('Failed to submit answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const QuizContent = () => (
    <>
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
                  onClick={() => setCurrent(current + 1)}
                  disabled={!answers[q._id]}
                  className="text-sm lg:text-base"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length !== questions.length || submitting}
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
    </>
  );

  // Use StudentLayout for authenticated users, simple layout for guests
  if (user) {
    return (
      <StudentLayout>
        <QuizContent />
      </StudentLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <QuizContent />
    </div>
  );
} 
'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
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
import { useSocket } from '@/lib/useSocket';
import io from "socket.io-client";

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
  // Guest info state, initialized from localStorage if available
  const [guestName, setGuestName] = useState(() => {
    if (typeof window !== 'undefined') {
      const info = window.localStorage.getItem('guestInfo');
      if (info) {
        try {
          return JSON.parse(info).guestName || '';
        } catch {}
      }
    }
    return '';
  });
  const [guestEmail, setGuestEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      const info = window.localStorage.getItem('guestInfo');
      if (info) {
        try {
          // Use guestContact as email if it looks like email
          const contact = JSON.parse(info).guestContact || '';
          return contact.includes('@') ? contact : '';
        } catch {}
      }
    }
    return '';
  });
  const [guestMobile, setGuestMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      const info = window.localStorage.getItem('guestInfo');
      if (info) {
        try {
          // Use guestContact as mobile if it looks like mobile
          const contact = JSON.parse(info).guestContact || '';
          return contact && !contact.includes('@') ? contact : '';
        } catch {}
      }
    }
    return '';
  });
  // --- Participants state for socket updates ---
  const [participants, setParticipants] = useState<any[]>([]);
  // --- Matching UI state ---
  const [shuffledRight, setShuffledRight] = useState<string[]>([]);

  // 🟢 Always call hooks at the top level, before any conditional returns
  const handleAnswerChange = useCallback((questionId: string, value: any) => {
    if (!questionId) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  // Fix: Only reset answer for Match questions, not for all
  useEffect(() => {
    const q = questions[current];
    if (q && q.type === 'Match' && Array.isArray(q.matchingPairs) && q.matchingPairs.length > 0) {
      const right = q.matchingPairs.map((pair: any) => pair.itemB);
      // Shuffle right items
      setShuffledRight(right.sort(() => Math.random() - 0.5));
      // Reset answer for this question only if not already set
      setAnswers(prev => {
        if (Array.isArray(prev[q._id]) && prev[q._id].length === q.matchingPairs.length) return prev;
        return { ...prev, [q._id]: Array(q.matchingPairs.length).fill('') };
      });
    }
    // Do NOT reset answers for other question types
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
        
        // Validate quiz ID format (should be a valid MongoDB ObjectId)
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
          console.error('Invalid quiz ID format:', id);
          setFetchError('Invalid quiz ID format. Please check the URL and try again.');
          setLoading(false);
          return;
        }
        
        // Use public API for guest users, authenticated API for logged-in users
        let res;
        if (user) {
          console.log('User is authenticated, using authenticated API');
          res = await api.get(`/live-quizzes/${id}`);
        } else {
          console.log('User is not authenticated, using public API');
          try {
            res = await liveQuizAPI.getPublicQuizById(id);
          } catch (publicError: any) {
            console.log('Public API failed, trying to use authenticated API as fallback');
            // If public API fails, try authenticated API as fallback
            try {
              res = await api.get(`/live-quizzes/${id}`);
            } catch (authError: any) {
              // If both fail, throw the original public error
              throw publicError;
            }
          }
        }
        
        console.log('Quiz API response:', res);
        setQuiz(res.data.data);
        console.log('Quiz data received:', res.data.data);
        
        // Use appropriate API for questions based on user authentication
        console.log('Fetching questions for quiz ID:', id);
        let qRes;
        if (user) {
          console.log('User is authenticated, using authenticated questions API');
          qRes = await liveQuizQuestionAPI.getQuestionsByQuiz(id);
        } else {
          console.log('User is not authenticated, using public questions API');
          try {
            qRes = await liveQuizQuestionAPI.getPublicQuestionsByQuiz(id);
          } catch (publicError: any) {
            console.log('Public questions API failed, trying to use authenticated API as fallback');
            // If public API fails, try authenticated API as fallback
            try {
              qRes = await liveQuizQuestionAPI.getQuestionsByQuiz(id);
            } catch (authError: any) {
              // If both fail, throw the original public error
              throw publicError;
            }
          }
        }
        console.log('Questions API response:', qRes);
        console.log('Questions received:', qRes.data.data);
        setQuestions(qRes.data.data || []);
        setFetchError(null);
      } catch (err: any) {
        // Log full error details for debugging
        console.error("Failed to fetch quiz or questions:", err);
        if (err?.response) {
          console.error("API Error Response:", err.response);
        }
        let errorMessage = "Failed to fetch quiz or questions. Please check your connection or try again later.";
        // Show specific error messages
        const apiMsg = err?.response?.data?.message?.toLowerCase() || "";
        if (apiMsg.includes('only live quizzes can be accessed by students')) {
          errorMessage = "This quiz is not live right now. Please contact the administrator.";
        } else if (err?.response?.status === 403 || apiMsg.includes('access denied')) {
          errorMessage = "You do not have permission to join this quiz.";
        } else if (apiMsg.includes('not live')) {
          errorMessage = "This quiz is not live right now. Please contact the administrator.";
        } else if (err?.response?.status === 404) {
          errorMessage = "Quiz not found. Please check the quiz ID or try again later.";
        } else if (err?.response?.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (err?.message) {
          errorMessage = err.message;
        }
        setQuiz(null);
        setQuestions([]);
        setFetchError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizAndQuestions();
  }, [id, user, authLoading]);

  // SOCKET.IO LOGIC FOR REAL-TIME PARTICIPANT UPDATES
  useEffect(() => {
    if (!id || !user) return;
    // Use the same socket URL as in the rest of the app
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "https://quiz-app-backend-pi.vercel.app");
    // const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");

    // Join quiz room
    socket.emit("join-quiz", { quizId: id, userId: user._id });

    // Listen for participant list updates
    socket.on("participant_list", (data) => {
      setParticipants(data);
    });

    // (Optional) Listen for other events as needed, e.g. quiz-joined, live_status, etc.
    socket.on("quiz-joined", (data) => {
      if (data.participants) setParticipants(data.participants);
    });

    // Clean up listeners and leave room on unmount
    return () => {
      socket.emit("leave-quiz", { quizId: id, userId: user._id });
      socket.off("participant_list");
      socket.off("quiz-joined");
      socket.disconnect();
    };
  }, [id, user]);

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
    let errorTitle = "Error Loading Quiz";
    let errorColor = "text-red-600";
    if (fetchError.includes("not live")) {
      errorTitle = "Quiz Not Live";
      errorColor = "text-yellow-700";
    } else if (fetchError.includes("permission") || fetchError.includes("Access denied")) {
      errorTitle = "Access Denied";
      errorColor = "text-red-700";
    }
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className={`text-xl lg:text-2xl font-bold mb-4 text-center ${errorColor}`}>{errorTitle}</h1>
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
  console.log('Rendering question', q?._id, 'current index:', current);
  if (!q) return <div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading question...</p></div></div>;






// Move renderInput to the very top of the file, before imports, to avoid any build/hook errors
/* --- renderInput must be at the very top of the file --- */
function renderInput({
  q,
  answers,
  handleAnswerChange,
  shuffledRight
}: {
  q: any,
  answers: Record<string, any>,
  handleAnswerChange: (questionId: string, value: any) => void,
  shuffledRight: string[]
}) {
  switch (q.type) {
    case 'MCQ': {
      const isMultiple = Array.isArray(q.correctAnswers) && q.correctAnswers.length > 1;
      if (isMultiple) {
        // Multiple-answer MCQ: use checkboxes
        const selected = Array.isArray(answers[q._id]) ? answers[q._id] : [];
        const handleCheckbox = (opt: string) => {
          if (selected.includes(opt)) {
            handleAnswerChange(q._id, selected.filter((o: string) => o !== opt));
          } else {
            handleAnswerChange(q._id, [...selected, opt]);
          }
        };
        return (
          <div className="flex flex-col gap-3 mt-4">
            {q.options.map((opt: string, idx: number) => (
              <label key={idx} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name={`answer-${q._id}`} // Unique name per question
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
                  name={`answer-${q._id}`} // Unique name per question
                  value={opt}
                  checked={answers[q._id] === opt}
                  onChange={() => handleAnswerChange(q._id, opt)}
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
            <input type="radio" name={`answer-${q._id}`} value="true" checked={answers[q._id] === 'true'} onChange={() => handleAnswerChange(q._id, 'true')} className="h-4 w-4" />
            <span className="text-sm lg:text-base">True</span>
          </label>
          <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="radio" name={`answer-${q._id}`} value="false" checked={answers[q._id] === 'false'} onChange={() => handleAnswerChange(q._id, 'false')} className="h-4 w-4" />
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
          onChange={e => handleAnswerChange(q._id, e.target.value)}
          placeholder="Type your answer..."
          // No key prop here
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
            }
          }}
        />
      );
    case 'Fill':
      return (
        <input
          className="w-full border rounded-lg p-3 mt-4 text-sm lg:text-base"
          value={answers[q._id] || ''}
          onChange={e => handleAnswerChange(q._id, e.target.value)}
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
        handleAnswerChange(q._id, prev);
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
            onChange={e => handleAnswerChange(q._id, e.target.value)}
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
      // For guests, use info from localStorage if available
      let gName = guestName, gEmail = guestEmail, gMobile = guestMobile;
      if (!user) {
        if (typeof window !== 'undefined') {
          const info = window.localStorage.getItem('guestInfo');
          if (info) {
            try {
              const parsed = JSON.parse(info);
              gName = parsed.guestName || gName;
              const contact = parsed.guestContact || '';
              if (contact.includes('@')) gEmail = contact;
              else gMobile = contact;
            } catch {}
          }
        }
        // Only show modal if guest info is truly missing AND not already set in localStorage
        if (!gName.trim() || (!gEmail.trim() && !gMobile.trim())) {
          // Check again if localStorage has valid guest info
          if (typeof window !== 'undefined') {
            const info = window.localStorage.getItem('guestInfo');
            if (info) {
              try {
                const parsed = JSON.parse(info);
                if (parsed.guestName && parsed.guestContact) {
                  // Use info from localStorage and continue
                  gName = parsed.guestName;
                  const contact = parsed.guestContact;
                  if (contact.includes('@')) gEmail = contact;
                  else gMobile = contact;
                }
              } catch {}
            }
          }
        }
        // If still missing, only then show modal
        if (!gName.trim() || (!gEmail.trim() && !gMobile.trim())) {
          setShowGuestModal(true);
          setSubmitting(false);
          return;
        }
      }
      // Prepare answers array for ALL questions
      const answersArray = questions.map((question) => {
        const ans = answers[question._id];
        let answerText = ans;
        if (question.type === 'MCQ') {
          const isMultiple = Array.isArray(question.correctAnswers) && question.correctAnswers.length > 1;
          if (isMultiple && !Array.isArray(ans)) answerText = ans ? [ans] : [];
          if (!isMultiple && Array.isArray(ans)) answerText = ans[0] || '';
        }
        return {
          questionId: question._id,
          answerText,
          timeTaken: 0
        };
      });
      if (user) {
        await api.post('/live-quiz-answers/submit-multiple', {
          quizId: quiz._id,
          answers: answersArray
        });
        setShowGuestModal(false);
        router.push('/result');
      } else {
        await liveQuizAnswerAPI.submitMultipleAnswersGuest({
          quizId: quiz._id,
          answers: answersArray,
          isGuest: true,
          guestName: gName,
          guestEmail: gEmail,
          guestMobile: gMobile
        });
        setShowGuestModal(false);
        router.push('/leaderboard?success=1');
      }
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
        let answerText = ans;
        if (question.type === 'MCQ') {
          const isMultiple = Array.isArray(question.correctAnswers) && question.correctAnswers.length > 1;
          if (isMultiple && !Array.isArray(ans)) answerText = ans ? [ans] : [];
          if (!isMultiple && Array.isArray(ans)) answerText = ans[0] || '';
        }
        return {
          questionId: question._id,
          answerText,
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
      router.push('/leaderboard?success=1');
    } catch (err) {
      setGuestError('Failed to submit answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Define QuizContent as a regular JSX variable (not memoized)
  const QuizContent = (
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
            {renderInput({ q, answers, handleAnswerChange, shuffledRight })}
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
        {QuizContent}
      </StudentLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {QuizContent}
    </div>
  );
}
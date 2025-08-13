"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { liveQuizAnswerAPI, liveQuizAPI, liveQuizQuestionAPI } from '@/lib/api';
import io from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "https://quiz-app-backend-pi.vercel.app");
// const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000");

export default function LiveQuizAnswerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLive, setIsLive] = useState(false);
  const [ended, setEnded] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [participants, setParticipants] = useState<any[]>([]);
  const [quizStatus, setQuizStatus] = useState<string>('loading');
  const [error, setError] = useState<string>('');

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to check if MCQ
  const isMCQ = (q: any) => q.type === 'MCQ' || q.type === 'mcq';

  // Fetch quiz and questions
  useEffect(() => {
    async function fetchQuiz() {
      try {
        setPageLoading(true);
        const quizRes = await liveQuizAPI.getQuizById(quizId);
        const quizData = quizRes.data.data;
        setQuiz(quizData);
        setIsLive(quizData.isLive === true);
        setQuizStatus(quizData.status);
        
        const qRes = await liveQuizQuestionAPI.getQuestionsByQuiz(quizId);
        setQuestions(qRes.data.data || []);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load quiz');
        setIsLive(false);
      } finally {
        setPageLoading(false);
      }
    }
    if (user) fetchQuiz();
  }, [quizId, user]);

  // Socket.IO: Handle real-time updates
  useEffect(() => {
    if (!quizId || !user) return;

    console.log('Connecting to socket for quiz:', quizId);

    // Join quiz room
    socket.emit("join-quiz", { quizId, userId: user._id });

    // Listen for quiz status updates
    socket.on("live_status", (data) => {
      console.log('Live status update:', data);
      setIsLive(data.live);
      if (!data.live) {
        setEnded(true);
        setQuizStatus('completed');
        setTimeout(() => router.push(`/live-quiz/${quizId}/overview`), 4000);
      }
    });

    // Listen for timer updates
    socket.on("timer-update", (data) => {
      console.log('Timer update:', data);
      setTimeRemaining(data.remaining);
      setTotalTime(data.total);
    });

    // Listen for timer status
    socket.on("timer-status", (data) => {
      console.log('Timer status:', data);
      setTimeRemaining(data.remaining);
      setTotalTime(data.total);
    });

    // Listen for quiz ended
    socket.on("quiz-ended", (data) => {
      console.log('Quiz ended:', data);
      setIsLive(false);
      setEnded(true);
      setQuizStatus('completed');
      setTimeout(() => router.push(`/live-quiz/${quizId}/overview`), 4000);
    });

    // Listen for participant list updates
    socket.on("participant_list", (data) => {
      console.log('Participant list update:', data);
      setParticipants(data);
    });

    // Listen for quiz joined confirmation
    socket.on("quiz-joined", (data) => {
      console.log('Quiz joined:', data);
      setIsLive(data.isLive);
      setQuizStatus(data.status);
      setParticipants(data.participants || []);
      if (data.timeLimit) {
        setTotalTime(data.timeLimit * 60);
        // Start local timer if socket timer is not working
        if (data.isLive && data.startedAt) {
          const elapsed = Math.floor((new Date().getTime() - new Date(data.startedAt).getTime()) / 1000);
          const remaining = Math.max(0, (data.timeLimit * 60) - elapsed);
          setTimeRemaining(remaining);
        }
      }
    });

    // Listen for quiz not live
    socket.on("quiz-not-live", (data) => {
      console.log('Quiz not live:', data);
      setError(data.message);
      setIsLive(false);
      setQuizStatus(data.status);
    });

    // Listen for errors
    socket.on("error", (data) => {
            // Guest state
            const [guestName, setGuestName] = useState('');
            const [guestId, setGuestId] = useState('');
            const [showGuestDialog, setShowGuestDialog] = useState(false);
      console.log('Socket error:', data);
      setError(data.message);
    });

    // Listen for connection status
    socket.on("connect", () => {
      console.log('Socket connected');
    });

    socket.on("disconnect", () => {
      console.log('Socket disconnected');
    });

    // Cleanup
    return () => {
      console.log('Cleaning up socket listeners');
      socket.off("live_status");
      socket.off("timer-update");
      socket.off("timer-status");
      socket.off("quiz-ended");
      socket.off("participant_list");
      socket.off("quiz-joined");
      socket.off("quiz-not-live");
      socket.off("error");
      socket.off("connect");
      socket.off("disconnect");
      socket.emit("leave-quiz", { quizId, userId: user._id });
    };
  }, [quizId, user, router]);

  // Local timer fallback
  useEffect(() => {
    if (!isLive || !totalTime || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setEnded(true);
          setIsLive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLive, totalTime, timeRemaining]);

  // Request timer status on mount and when quiz becomes live
  useEffect(() => {
    if (quizId && isLive) {
      console.log('Requesting timer status for quiz:', quizId);
      socket.emit("request-timer-status", { quizId });
    }
  }, [quizId, isLive]);

  // Initialize timer when quiz data is loaded
  useEffect(() => {
    if (quiz && quiz.timeLimit && quiz.isLive) {
      setTotalTime(quiz.timeLimit * 60);
      // If quiz has started, calculate remaining time
      if (quiz.startedAt) {
        const elapsed = Math.floor((new Date().getTime() - new Date(quiz.startedAt).getTime()) / 1000);
        const remaining = Math.max(0, (quiz.timeLimit * 60) - elapsed);
        setTimeRemaining(remaining);
      }
    }
  }, [quiz]);

  if (loading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Please log in to join the quiz.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          onClick={() => router.push('/live-quiz')} 
          className="mt-4"
        >
          Back to Live Quizzes
        </Button>
      </div>
    );
  }

  if (!quiz || !isLive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              {ended ? 'Quiz Ended' : 'Quiz Not Available'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              {ended 
                ? 'The live quiz has ended. Redirecting to overview...'
                : 'This quiz is not currently live or has not started yet.'
              }
            </p>
            {!ended && (
              <Button onClick={() => router.push('/live-quiz')}>
                Back to Live Quizzes
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[current];

  // Handle answer selection
  const handleSelect = (option: string) => {
    if (!isLive || ended) return;
    if (isMCQ(question)) {
      setAnswers((prev) => {
        const prevArr = Array.isArray(prev[question._id]) ? prev[question._id] : [];
        if (prevArr.includes(option)) {
          // Unselect
          return { ...prev, [question._id]: prevArr.filter((o: string) => o !== option) };
        } else {
          // Select
          return { ...prev, [question._id]: [...prevArr, option] };
        }
      });
    } else {
      setAnswers((prev) => ({ ...prev, [question._id]: option }));
    }
  };

  // Navigation
  const next = () => setCurrent((c) => Math.min(c + 1, questions.length - 1));
  const back = () => setCurrent((c) => Math.max(c - 1, 0));

  // Submit all answers
  const handleSubmit = async () => {
    if (!isLive || ended) return;
    
    try {
      console.log('Submitting answers for quiz:', quizId);
      console.log('Total questions:', questions.length);
      console.log('Answers collected:', Object.keys(answers).length);
      console.log('Answers:', answers);

      // Prepare answers array for ALL questions, not just answered ones
      const answersArray = questions.map((question, index) => {
        let answerText = answers[question._id];
        if (isMCQ(question)) {
          answerText = Array.isArray(answerText) ? answerText : [];
        } else {
          answerText = answerText || '';
        }
        console.log(`Question ${index + 1}: ${question.questionText}`);
        console.log(`Answer: ${answerText}`);
        return {
          questionId: question._id,
          answerText: answerText,
          timeTaken: Math.floor(Math.random() * 60) + 10 // Random time between 10-70 seconds
        };
      });

      console.log('Prepared answers array:', answersArray);
      console.log('Total answers to submit:', answersArray.length);

      // Use the new bulk submission endpoint
      const response = await liveQuizAnswerAPI.submitMultipleAnswers({
        quizId,
        answers: answersArray
      });

      console.log('Answers submitted successfully:', response.data);
      console.log('Submitted count:', response.data.data?.submittedCount);
      
      // Show success message before redirecting
      alert(`Quiz submitted successfully! ${response.data.data?.submittedCount || answersArray.length} answers submitted.`);
      router.push('/complete-quiz');
    } catch (error: any) {
      console.error('Error submitting answers:', error);
      setError(error.response?.data?.message || 'Failed to submit answers');
      
      // Show error message
      alert('Failed to submit quiz. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      {/* Header with live status and timer */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isLive ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
                <Badge variant={isLive ? "default" : "destructive"}>
                  {isLive ? 'LIVE' : 'OFFLINE'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {participants.length} participants
                </span>
              </div>
            </div>
            
            {/* Timer */}
            {isLive && totalTime > 0 && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className={`font-mono text-lg font-bold ${
                  timeRemaining <= 60 ? 'text-red-600' : 'text-gray-700'
                }`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Quiz Content */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-gray-500">
              Question {current + 1} of {questions.length}
            </span>
            <div className="flex space-x-2">
              <Badge variant="outline">{question?.type || 'MCQ'}</Badge>
              <Badge variant="outline">{question?.marks || 1} point{question?.marks !== 1 ? 's' : ''}</Badge>
            </div>
          </div>

          {question && (
            <>
              <div className="text-2xl font-bold text-center mb-8">
                {question.questionText}
              </div>

              {question.imageUrl && (
                <div className="flex justify-center mb-6">
                  <img 
                    src={question.imageUrl} 
                    alt="Question" 
                    className="max-w-full h-auto max-h-64 rounded"
                  />
                </div>
              )}

              {isMCQ(question) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {question.options && question.options.map((opt: string, idx: number) => (
                    <label key={idx} className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer bg-white hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={Array.isArray(answers[question._id]) && answers[question._id].includes(opt)}
                        onChange={() => handleSelect(opt)}
                        disabled={!isLive || ended}
                        className="h-5 w-5 accent-blue-600"
                      />
                      <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                      <span className="text-lg">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {question.options && question.options.map((opt: string, idx: number) => (
                    <Button
                      key={idx}
                      variant={answers[question._id] === opt ? "default" : "outline"}
                      className={`w-full py-6 text-lg justify-start ${
                        answers[question._id] === opt 
                          ? "bg-blue-500 text-white hover:bg-blue-600" 
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleSelect(opt)}
                      disabled={!isLive || ended}
                    >
                      <span className="font-bold mr-3">{String.fromCharCode(65 + idx)}.</span>
                      {opt}
                    </Button>
                  ))}
                </div>
              )}

              <div className="flex justify-between">
                <Button 
                  onClick={back} 
                  disabled={current === 0 || !isLive || ended}
                  variant="outline"
                >
                  Previous
                </Button>
                
                {current < questions.length - 1 ? (
                  <Button 
                    onClick={next}
                    disabled={!isLive || ended}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!isLive || ended}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Submit Quiz ({Object.keys(answers).length}/{questions.length} answered)
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quiz ended message */}
      {ended && (
        <Alert className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Quiz Ended!</strong> Time is up. Redirecting to overview...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 
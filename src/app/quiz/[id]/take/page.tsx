'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { assignmentAPI, assignmentQuestionAPI, assignmentAnswerAPI } from '@/lib/api';

interface Question {
  _id: string;
  questionText: string;
  questionType: 'mcq' | 'true_false' | 'short_answer' | 'long_answer' | 'fill_blank';
  options?: string[];
  correctAnswer?: string;
  marks: number;
  timeLimit?: number;
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  timeLimit: number;
  maxMarks: number;
  questions: Question[];
}

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isStarted, timeLeft]);

  const fetchQuiz = async () => {
    try {
      const response = await assignmentAPI.getAssignmentById(quizId);
      const quizData = response.data.assignment;
      setQuiz(quizData);
      setTimeLeft(quizData.timeLimit * 60); // Convert to seconds
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load quiz",
      });
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    setIsSubmitted(true);
    try {
      await assignmentAnswerAPI.submitAnswer({
        assignmentId: quizId,
        answers: answers,
        timeTaken: quiz.timeLimit * 60 - timeLeft
      });

      toast({
        title: "Success",
        description: "Quiz submitted successfully!",
      });

      router.push('/complete-quiz');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit quiz",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!quiz) return 0;
    return ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  };

  const renderQuestion = (question: Question) => {
    const currentAnswer = answers[question._id];

    switch (question.questionType) {
      case 'mcq':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name={question._id}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                  className="h-4 w-4 text-[#0E2647] focus:ring-[#FAB364]"
                />
                <span className="flex-1">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-3">
            {['True', 'False'].map((option) => (
              <label
                key={option}
                className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name={question._id}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                  className="h-4 w-4 text-[#0E2647] focus:ring-[#FAB364]"
                />
                <span className="flex-1">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'short_answer':
        return (
          <input
            type="text"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            placeholder="Enter your answer"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#FAB364] focus:border-[#FAB364]"
          />
        );

      case 'long_answer':
        return (
          <textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            placeholder="Enter your detailed answer"
            rows={6}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#FAB364] focus:border-[#FAB364] resize-none"
          />
        );

      case 'fill_blank':
        return (
          <input
            type="text"
            value={currentAnswer || ''}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            placeholder="Fill in the blank"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#FAB364] focus:border-[#FAB364]"
          />
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0E2647]"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Quiz not found</p>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-[#0E2647] mb-4">
              {quiz.title}
            </CardTitle>
            <p className="text-gray-600">{quiz.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="font-semibold">{formatTime(quiz.timeLimit * 60)}</p>
                <p className="text-sm text-gray-600">Time Limit</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-semibold">{quiz.questions.length}</p>
                <p className="text-sm text-gray-600">Questions</p>
              </div>
            </div>
            <Button 
              onClick={handleStart}
              className="w-full bg-[#0E2647] hover:bg-[#FAB364] hover:text-[#0E2647] transition-all duration-300"
              size="lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#0E2647]">{quiz.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-red-600">
                <Clock className="h-5 w-5" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitted}
                className="bg-red-600 hover:bg-red-700"
              >
                Submit Quiz
              </Button>
            </div>
          </div>
          <Progress value={getProgress()} className="mt-4" />
        </div>
      </div>

      {/* Question Content */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    Question {currentQuestionIndex + 1}
                  </CardTitle>
                  <Badge variant="outline">
                    {currentQuestion.marks} marks
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-lg">
                  {currentQuestion.questionText}
                </div>
                
                {renderQuestion(currentQuestion)}

                <div className="flex justify-between pt-6">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  
                  {currentQuestionIndex < quiz.questions.length - 1 ? (
                    <Button onClick={handleNext}>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={isSubmitted}>
                      Submit Quiz
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 
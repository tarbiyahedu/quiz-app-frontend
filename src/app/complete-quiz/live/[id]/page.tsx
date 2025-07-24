"use client";

import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Target,
  Award
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { liveQuizAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type QuizAnswer = {
  questionId: string;
  questionText: string;
  questionType: string;
  questionOptions: string[];
  correctAnswer: any;
  userAnswer: any;
  isCorrect: boolean;
  score: number;
  marks: number;
  order: number;
  imageUrl?: string;
  videoUrl?: string;
  timeTaken: number;
  answered: boolean;
  explanation?: string;
};

type QuizDetails = {
  quizId: string;
  title: string;
  description: string;
  type: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completionDate: string;
  department: string;
  answers: QuizAnswer[];
};

export default function LiveQuizDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizDetails = async () => {
      if (!user || !params.id) return;
      
      setLoading(true);
      setError("");
      try {
        const response = await liveQuizAPI.getCompletedQuizDetails(params.id as string);
        setQuizDetails(response.data.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch quiz details");
        toast({
          title: "Error",
          description: "Failed to load quiz details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [user, params.id, toast]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0E2647] border-t-transparent"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const renderAnswer = (answer: QuizAnswer) => {
    const isMCQ = answer.questionType === 'MCQ' || answer.questionType === 'mcq';
    const userAnswersArr = Array.isArray(answer.userAnswer) ? answer.userAnswer : [answer.userAnswer];
    const correctAnswersArr = Array.isArray(answer.correctAnswer) ? answer.correctAnswer : [answer.correctAnswer];
    const renderQuestionContent = () => {
      if (answer.imageUrl) {
        return (
          <div className="mb-4">
            <img src={answer.imageUrl} alt="Question" className="max-w-md rounded-lg" />
          </div>
        );
      }
      if (answer.videoUrl) {
        return (
          <div className="mb-4">
            <video controls className="max-w-md rounded-lg">
              <source src={answer.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }
      return null;
    };

    const renderOptions = () => {
      if (!answer.questionOptions || answer.questionOptions.length === 0) return null;
      if (isMCQ) {
        return (
          <div className="space-y-2 mb-4">
            {answer.questionOptions.map((option, index) => {
              const isCorrect = correctAnswersArr.includes(option);
              const isSelected = userAnswersArr.includes(option);
              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-base ${
                    isCorrect && isSelected
                      ? 'bg-green-100 border-green-400'
                      : isCorrect
                      ? 'bg-green-50 border-green-300'
                      : isSelected
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                  {isCorrect && (
                    <CheckCircle className="inline ml-2 h-4 w-4 text-green-500" />
                  )}
                  {isSelected && !isCorrect && (
                    <XCircle className="inline ml-2 h-4 w-4 text-red-500" />
                  )}
                </div>
              );
            })}
          </div>
        );
      }
      // Fallback for other types
      return (
        <div className="space-y-2 mb-4">
          {answer.questionOptions.map((option, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                answer.userAnswer === option
                  ? answer.isCorrect
                    ? 'bg-green-100 border-green-300'
                    : 'bg-red-100 border-red-300'
                  : answer.correctAnswer === option
                  ? 'bg-green-100 border-green-300'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
              {option}
              {answer.userAnswer === option && !answer.isCorrect && (
                <XCircle className="inline ml-2 h-4 w-4 text-red-500" />
              )}
              {answer.correctAnswer === option && (
                <CheckCircle className="inline ml-2 h-4 w-4 text-green-500" />
              )}
            </div>
          ))}
          
          {/* Show user's answer if it's not in the options (for debugging) */}
          {answer.userAnswer && answer.userAnswer.trim() !== '' && 
           !answer.questionOptions.includes(answer.userAnswer) && (
            <div className="p-3 rounded-lg border-2 border-orange-300 bg-orange-50">
              <span className="font-medium text-orange-700">
                Your submitted answer: {answer.userAnswer}
              </span>
            </div>
          )}
        </div>
      );
    };

    return (
      <Card key={answer.questionId} className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Question {answer.order}</CardTitle>
            <div className="flex items-center space-x-2">
              {answer.answered ? (
                <>
                  <Badge variant={answer.isCorrect ? "default" : "destructive"}>
                    {answer.isCorrect ? "Correct" : "Incorrect"}
                  </Badge>
                  <Badge variant="outline">{answer.score}/{answer.marks} points</Badge>
                </>
              ) : (
                <Badge variant="secondary">Not Answered</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderQuestionContent()}
          <div className="mb-2">
            <h4 className="font-medium mb-1">Question</h4>
            <div className="mb-2 text-[#0E2647] font-semibold">{answer.questionText}</div>
          </div>
          {renderOptions()}
          <div className="mb-2">
            <h4 className="font-medium mb-1">Your Answer</h4>
            <div className={answer.isCorrect ? "text-green-700" : "text-red-700"}>
              {isMCQ
                ? userAnswersArr.length > 0
                  ? userAnswersArr.map((ans, i) => <span key={i} className="inline-block mr-2">{ans}</span>)
                  : <span className="text-gray-400">Not answered</span>
                : answer.userAnswer && answer.userAnswer.toString().trim() !== ''
                  ? answer.userAnswer.toString()
                  : <span className="text-gray-400">Not answered</span>
              }
            </div>
          </div>
          <div className="mb-2">
            <h4 className="font-medium mb-1">Correct Answer</h4>
            <div className="text-blue-700">
              {isMCQ
                ? correctAnswersArr.length > 0
                  ? correctAnswersArr.map((ans, i) => <span key={i} className="inline-block mr-2">{ans}</span>)
                  : <span className="text-gray-400">None</span>
                : answer.correctAnswer && answer.correctAnswer.toString()
              }
            </div>
          </div>
          {answer.explanation && (
            <div className="mt-2 p-3 rounded-lg bg-gray-50">
              <h5 className="font-medium mb-1">Explanation</h5>
              <p className="text-sm text-gray-700">{answer.explanation}</p>
            </div>
          )}
          {answer.answered && answer.timeTaken > 0 && (
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              Time taken: {formatTime(answer.timeTaken)}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const handleDownloadPDF = () => {
    if (!quizDetails) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(quizDetails.title || 'Quiz Result', 14, 18);
    doc.setFontSize(12);
    doc.text(`Score: ${quizDetails.score}%`, 14, 28);
    doc.text(`Correct: ${quizDetails.correctAnswers}/${quizDetails.totalQuestions}`, 14, 36);
    doc.text(`Time Taken: ${quizDetails.timeTaken} min`, 14, 44);
    doc.text(`Completed: ${formatDate(quizDetails.completionDate)}`, 14, 52);
    doc.text(`Department: ${quizDetails.department}`, 14, 60);
    doc.text(`Type: ${quizDetails.type}`, 14, 68);
    // Table of questions
    autoTable(doc, {
      startY: 75,
      head: [[
        'Q#',
        'Question',
        'Your Answer',
        'Correct Answer',
        'Correct?',
        'Score'
      ]],
      body: quizDetails.answers.map((a, idx) => [
        a.order,
        a.questionText,
        a.userAnswer && a.userAnswer.toString(),
        a.correctAnswer && a.correctAnswer.toString(),
        a.isCorrect ? 'Yes' : 'No',
        `${a.score}/${a.marks}`
      ]),
      styles: { fontSize: 9, cellWidth: 'wrap' },
      headStyles: { fillColor: [22, 82, 147] },
      columnStyles: {
        1: { cellWidth: 60 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 18 },
        5: { cellWidth: 18 }
      }
    });
    doc.save(`${quizDetails.title || 'quiz-result'}.pdf`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0E2647] border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !quizDetails) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || "Quiz details not found"}</p>
          <Button onClick={() => router.push('/complete-quiz')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Complete Quizzes
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => router.push('/complete-quiz')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Complete Quizzes
            </Button>
            <h1 className="text-3xl font-bold text-[#0E2647]">{quizDetails.title}</h1>
            <p className="text-gray-600 mt-2">{quizDetails.description}</p>
          </div>
        </div>

        {/* Add a summary card at the top */}
        <div className="mb-6">
          <Card>
            <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between py-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#0E2647] mb-1">Quiz Summary</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                  <span><b>Score:</b> <span className={getScoreColor(quizDetails.score)}>{quizDetails.score}%</span></span>
                  <span><b>Correct:</b> {quizDetails.correctAnswers}/{quizDetails.totalQuestions}</span>
                  <span><b>Time Taken:</b> {quizDetails.timeTaken} min</span>
                  <span><b>Completed:</b> {formatDate(quizDetails.completionDate)}</span>
                </div>
              </div>
              {/* Placeholder for PDF export button */}
              <Button variant="outline" className="mt-4 md:mt-0" onClick={handleDownloadPDF}>Download Result as PDF</Button>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(quizDetails.score)}`}>
                {quizDetails.score}%
              </div>
              <div className="text-sm text-gray-600">Final Score</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-[#0E2647]">
                {quizDetails.correctAnswers}/{quizDetails.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-[#0E2647]">
                {quizDetails.timeTaken}m
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-8 w-8 text-[#FAB364]" />
              </div>
              <div className="text-sm font-bold text-[#0E2647]">
                {formatDate(quizDetails.completionDate)}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Overall Performance</span>
                  <span className={getScoreColor(quizDetails.score)}>{quizDetails.score}%</span>
                </div>
                <Progress value={quizDetails.score} className="h-3" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Quiz Type:</span>
                  <Badge variant="outline">{quizDetails.type}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Department:</span>
                  <span>{quizDetails.department}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Details */}
        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quizDetails.answers.map(renderAnswer)}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 
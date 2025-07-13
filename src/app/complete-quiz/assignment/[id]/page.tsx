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
  Calendar,
  Target,
  Award
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { assignmentAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type AssignmentAnswer = {
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
};

type AssignmentDetails = {
  assignmentId: string;
  title: string;
  description: string;
  type: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completionDate: string;
  department: string;
  answers: AssignmentAnswer[];
};

export default function AssignmentQuizDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [assignmentDetails, setAssignmentDetails] = useState<AssignmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      if (!user || !params.id) return;
      
      setLoading(true);
      setError("");
      try {
        const response = await assignmentAPI.getCompletedAssignmentDetails(params.id as string);
        setAssignmentDetails(response.data.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch assignment details");
        toast({
          title: "Error",
          description: "Failed to load assignment details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentDetails();
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const renderAnswer = (answer: AssignmentAnswer) => {
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
        </div>
      );
    };

    return (
      <Card key={answer.questionId} className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Question {answer.order}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={answer.isCorrect ? "default" : "destructive"}>
                {answer.isCorrect ? "Correct" : "Incorrect"}
              </Badge>
              <Badge variant="outline">{answer.score}/{answer.marks} points</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderQuestionContent()}
          <div className="mb-4">
            <h4 className="font-medium mb-2">{answer.questionText}</h4>
            {renderOptions()}
          </div>
          
          {answer.questionType !== 'MCQ' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Your Answer:</span>
                <span className={answer.isCorrect ? "text-green-600" : "text-red-600"}>
                  {answer.userAnswer || "No answer provided"}
                </span>
              </div>
              {!answer.isCorrect && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Correct Answer:</span>
                  <span className="text-green-600">{answer.correctAnswer}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
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

  if (error || !assignmentDetails) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || "Assignment details not found"}</p>
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
            <h1 className="text-3xl font-bold text-[#0E2647]">{assignmentDetails.title}</h1>
            <p className="text-gray-600 mt-2">{assignmentDetails.description}</p>
          </div>
        </div>

        {/* Assignment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(assignmentDetails.score)}`}>
                {assignmentDetails.score}%
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
                {assignmentDetails.correctAnswers}/{assignmentDetails.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-8 w-8 text-[#FAB364]" />
              </div>
              <div className="text-sm font-bold text-[#0E2647]">
                {formatDate(assignmentDetails.completionDate)}
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
                  <span className={getScoreColor(assignmentDetails.score)}>{assignmentDetails.score}%</span>
                </div>
                <Progress value={assignmentDetails.score} className="h-3" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Assignment Type:</span>
                  <Badge variant="outline">{assignmentDetails.type}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>Department:</span>
                  <span>{assignmentDetails.department}</span>
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
              {assignmentDetails.answers.map(renderAnswer)}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 
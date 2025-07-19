"use client";

import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Clock, 
  Calendar,
  Trophy,
  Target,
  Award,
  Search,
  Eye
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { liveQuizAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type CompletedQuiz = {
  id: string;
  title: string;
  description: string;
  type: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completionDate: string;
  department: string;
  category: string;
};

export default function CompleteQuizPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [completedQuizzes, setCompletedQuizzes] = useState<CompletedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompletedQuizzes = async () => {
      if (!user) return;
      
      setLoading(true);
      setError("");
      try {
        const response = await liveQuizAPI.getAllCompletedQuizzes();
        setCompletedQuizzes(response.data.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch completed quizzes");
        toast({
          title: "Error",
          description: "Failed to load completed quizzes",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedQuizzes();
  }, [user, toast]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0E2647] border-t-transparent"></div>
      </div>
    );
  }

  const filteredQuizzes = completedQuizzes.filter(quiz =>
    quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-blue-100 text-blue-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (quiz: CompletedQuiz) => {
    if (quiz.type === 'Live Quiz') {
      router.push(`/complete-quiz/live/${quiz.id}`);
    } else {
      router.push(`/complete-quiz/assignment/${quiz.id}`);
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0E2647]">Complete Quiz</h1>
          <p className="text-gray-600 mt-2">View your completed quizzes and track your progress.</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search completed quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E2647] focus:border-transparent"
          />
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-[#0E2647]">{completedQuizzes.length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-[#0E2647]">
                {completedQuizzes.length > 0 
                  ? Math.round(completedQuizzes.reduce((acc, quiz) => acc + (quiz.score || 0), 0) / completedQuizzes.length)
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-8 w-8 text-[#FAB364]" />
              </div>
              <div className="text-2xl font-bold text-[#0E2647]">
                {completedQuizzes.filter(quiz => (quiz.score || 0) >= 90).length}
              </div>
              <div className="text-sm text-gray-600">High Scores (90%+)</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-[#0E2647]">
                {completedQuizzes.reduce((acc, quiz) => acc + (quiz.timeTaken || 0), 0)}m
              </div>
              <div className="text-sm text-gray-600">Total Time</div>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Card>
            <CardContent className="text-center py-6">
              <div className="text-red-600">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* Completed Quizzes List */}
        <Card>
          <CardHeader>
            <CardTitle>Completed Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredQuizzes.map((quiz) => (
                <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-[#0E2647]">{quiz.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {quiz.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {quiz.category}
                      </Badge>
                      <Badge className={`text-xs ${getScoreBadgeColor(quiz.score)}`}>
                        {quiz.score}%
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(quiz.completionDate || new Date().toISOString())}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{quiz.timeTaken || 0}m</span>
                      </div>
                      <div>
                        <span>{quiz.correctAnswers || 0}/{quiz.totalQuestions || 0} correct</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Performance</span>
                        <span className={getScoreColor(quiz.score)}>{quiz.score}%</span>
                      </div>
                      <Progress value={quiz.score} className="h-2" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(quiz)}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* No Results */}
        {filteredQuizzes.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed quizzes found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search terms." : "Complete some quizzes to see your results here."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from(new Set(completedQuizzes.map(q => q.category))).map(category => {
                  const categoryQuizzes = completedQuizzes.filter(q => q.category === category);
                  const avgScore = categoryQuizzes.length > 0 
                    ? Math.round(categoryQuizzes.reduce((acc, quiz) => acc + quiz.score, 0) / categoryQuizzes.length)
                    : 0;
                  
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{category}</span>
                        <span className="text-sm text-gray-600">{avgScore}%</span>
                      </div>
                      <Progress value={avgScore} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedQuizzes.filter(q => q.score >= 90).slice(0, 3).map((quiz, index) => (
                  <div key={quiz.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Award className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Excellent Score!</p>
                      <p className="text-sm text-green-600">Achieved {quiz.score}% on {quiz.title}</p>
                    </div>
                  </div>
                ))}
                {completedQuizzes.filter(q => q.score >= 90).length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Complete quizzes to see your achievements here!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 
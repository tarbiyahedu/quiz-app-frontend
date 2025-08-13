"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { liveQuizAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/ui/dashboard-layout';

export default function AdminResultsOverviewPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchQuizStatistics = async () => {
      try {
        setLoading(true);
        const response = await liveQuizAPI.getQuizStatistics({ status: 'completed' });
        setQuizzes(response.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch quiz statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizStatistics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading quiz statistics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate overall statistics
  const totalParticipants = quizzes.reduce((sum, quiz) => sum + (quiz.participantCount || 0), 0);
  const totalQuestions = quizzes.reduce((sum, quiz) => sum + (quiz.questionCount || 0), 0);
  const averageScore = quizzes.length > 0 
    ? Math.round(quizzes.reduce((sum, quiz) => sum + (quiz.averageScore || 0), 0) / quizzes.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0E2647]">Results Overview</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">
            View detailed results and analytics for all completed live quizzes.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">Total Completed Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-blue-600">{quizzes.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">Total Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-green-600">{totalParticipants}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-purple-600">{averageScore}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">Total Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-orange-600">{totalQuestions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz._id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base lg:text-lg font-semibold text-[#0E2647] line-clamp-2">
                    {quiz.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs lg:text-sm">
                    {Array.isArray(quiz.departments) && quiz.departments.length > 0
                      ? quiz.departments.map((d: any) => d?.name || d).join(", ")
                      : quiz.department?.name || quiz.department || 'Unknown'}
                  </Badge>
                </div>
                <p className="text-xs lg:text-sm text-gray-600 line-clamp-2">
                  {quiz.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 lg:space-y-4">
                <div className="grid grid-cols-2 gap-2 lg:gap-3 text-xs lg:text-sm">
                  <div>
                    <span className="text-gray-600">Participants:</span>
                    <div className="font-semibold">{quiz.participantCount || 0}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Questions:</span>
                    <div className="font-semibold">{quiz.questionCount || 0}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ended:</span>
                    <div className="font-semibold">
                      {quiz.endTime 
                        ? new Date(quiz.endTime).toLocaleDateString()
                        : 'N/A'
                      }
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Score:</span>
                    <div className="font-semibold">{quiz.averageScore || 0}%</div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => router.push(`/admin/results-overview/${quiz._id}`)}
                  className="w-full text-xs lg:text-sm"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {quizzes.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-600 mb-2">No Completed Quizzes</h3>
            <p className="text-sm lg:text-base text-gray-500">
              There are no completed quizzes to display yet.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 
"use client";

import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  TrendingUp, 
  Calendar,
  Clock,
  Target,
  Award
} from "lucide-react";
import { useEffect, useState } from "react";
import { liveQuizAPI } from "@/lib/api";

export default function ResultPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    liveQuizAPI.getAllCompletedQuizzes()
      .then(res => {
        setResults(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load results");
        setLoading(false);
      });
  }, [user]);

  if (!user || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0E2647] border-t-transparent"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-600">{error}</div>
    );
  }

  // Calculate performance stats
  const totalQuizzes = results.length;
  const averageScore = totalQuizzes > 0 ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / totalQuizzes) : 0;
  const bestScore = results.reduce((max, r) => Math.max(max, r.score || 0), 0);
  const totalTime = results.reduce((sum, r) => sum + (r.timeTaken || 0), 0);
  // For improvement, you may want to compare last N scores, here just a placeholder
  const improvement = totalQuizzes > 1 ? `${results[totalQuizzes-1].score - results[0].score > 0 ? '+' : ''}${results[totalQuizzes-1].score - results[0].score}%` : '0%';

  // Category performance (by department/category)
  const categoryMap: Record<string, { score: number, questions: number, count: number }> = {};
  results.forEach(r => {
    const cat = r.category || r.department || 'Other';
    if (!categoryMap[cat]) categoryMap[cat] = { score: 0, questions: 0, count: 0 };
    categoryMap[cat].score += r.score || 0;
    categoryMap[cat].questions += r.totalQuestions || 0;
    categoryMap[cat].count += 1;
  });
  const categoryPerformance = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    score: data.count > 0 ? Math.round(data.score / data.count) : 0,
    questions: data.questions
  }));

  // Sort results by completion date (most recent first)
  const recentResults = [...results].sort((a, b) => {
    const dateA = a.completionDate ? new Date(a.completionDate).getTime() : 0;
    const dateB = b.completionDate ? new Date(b.completionDate).getTime() : 0;
    return dateB - dateA;
  }).slice(0, 5);

  const performanceStats = {
    totalQuizzes,
    averageScore,
    bestScore,
    totalTime: `${Math.floor(totalTime / 60)}h ${totalTime % 60}m`,
    improvement
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0E2647]">Results</h1>
          <p className="text-gray-600 mt-2">Track your performance and see your progress over time.</p>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-8 w-8 text-[#FAB364]" />
              </div>
              <div className="text-2xl font-bold text-[#0E2647]">{performanceStats.totalQuizzes}</div>
              <div className="text-sm text-gray-600">Total Quizzes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-[#0E2647]">{performanceStats.averageScore}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-[#0E2647]">{performanceStats.bestScore}%</div>
              <div className="text-sm text-gray-600">Best Score</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-[#0E2647]">{performanceStats.improvement}</div>
              <div className="text-sm text-gray-600">Improvement</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResults.map((result, idx) => (
                <div key={result.id || result.quizId || idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-[#0E2647]">{result.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                      {/* Optionally show rank if available */}
                      {result.rank && result.rank <= 3 && (
                        <Badge className="bg-[#FAB364] text-white text-xs">
                          #{result.rank}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{result.completionDate ? new Date(result.completionDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{result.timeTaken || 0} min</span>
                      </div>
                      <div>
                        <span>{result.correctAnswers || 0}/{result.totalQuestions || 0} correct</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#0E2647]">{result.score}%</div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryPerformance.map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-sm text-gray-600">{category.score}%</span>
                    </div>
                    <Progress value={category.score} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">
                      {category.questions} questions attempted
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Performance chart will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-16 h-16 bg-[#FAB364] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-medium">Quiz Master</h3>
                <p className="text-sm text-gray-600">Complete 20 quizzes</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-medium">Perfect Score</h3>
                <p className="text-sm text-gray-600">Get 100% on any quiz</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-medium">Top Performer</h3>
                <p className="text-sm text-gray-600">Rank #1 in a live quiz</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 
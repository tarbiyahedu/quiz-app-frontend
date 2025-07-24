"use client";

import StudentLayout from "@/app/layouts/student-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Trophy, Clock, Target, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { liveQuizAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
  const [completedQuizzes, setCompletedQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      liveQuizAPI.getAllQuizzes({ status: 'live', limit: 100 }), // For upcoming/ongoing
      liveQuizAPI.getCompletedQuizzes(), // For participated
      liveQuizAPI.getAllQuizzes({ status: 'live', limit: 100 }) // fallback, since getAvailableQuizzes does not exist
    ])
      .then(([allLive, completed, available]) => {
        // Filter quizzes based on user's departments
        let filteredAvailable = available.data?.data || available.data || [];
        if (user.departments && user.departments.length > 0) {
          const userDeptIds = user.departments.map(dept => dept._id);
          filteredAvailable = filteredAvailable.filter((quiz: any) => 
            userDeptIds.includes(quiz.department?._id)
          );
        } else if (user.department) {
          // Fallback to old department field
          filteredAvailable = filteredAvailable.filter((quiz: any) => 
            quiz.department?._id === user.department?._id
          );
        }
        
        setAvailableQuizzes(filteredAvailable);
        setCompletedQuizzes((completed.data?.data || completed.data) ?? []);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load dashboard data");
        setLoading(false);
      });
  }, [user]);

  if (!user || loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0E2647] border-t-transparent"></div></div>;
  }
  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-600">{error}</div>;
  }

  // Stats
  const quizzesTaken = completedQuizzes.length;
  const availableCount = availableQuizzes.length;
  const lastQuiz = completedQuizzes.length > 0 ? completedQuizzes[0] : null;
  const averageScore = quizzesTaken > 0 ? Math.round(completedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzesTaken) : 0;
  // For study time and achievements, keep demo or add logic if available

  return (
    <StudentLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0E2647]">Student Dashboard</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">Welcome back! Here's your learning progress and available quizzes.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Quizzes Taken</CardTitle>
              <BookOpen className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">{quizzesTaken}</div>
              <p className="text-xs text-muted-foreground">
                {/* +X this week */}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Average Score</CardTitle>
              <Target className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">{averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                {/* +X% from last month */}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Available Live Quizzes</CardTitle>
              <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">{availableCount}</div>
              <p className="text-xs text-muted-foreground">
                {/* This week */}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Last Participated Quiz</CardTitle>
              <Trophy className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {lastQuiz ? (
                <div>
                  <div className="font-bold">{lastQuiz.title}</div>
                  <div className="text-xs text-muted-foreground">Score: {lastQuiz.score}%</div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">No quiz taken yet</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Available Quizzes and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base lg:text-lg">
                <GraduationCap className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-[#FAB364]" />
                Available Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="space-y-2 lg:space-y-3">
                {availableQuizzes.length === 0 && <div className="text-xs text-muted-foreground">No available live quizzes</div>}
                {availableQuizzes.map((quiz, idx) => (
                  <div key={quiz._id || idx} className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm lg:text-base">{quiz.title}</h3>
                        <p className="text-xs lg:text-sm text-gray-600">Live Quiz • {quiz.timeLimit || 30} minutes</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Live Now</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 lg:space-y-4">
                {completedQuizzes.length === 0 && <div className="text-xs text-muted-foreground">No recent activity</div>}
                {completedQuizzes.slice(0, 4).map((quiz, idx) => (
                  <div key={quiz.quizId || quiz.id || idx} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-xs lg:text-sm font-medium">Completed {quiz.title}</p>
                      <p className="text-xs text-gray-600">Score: {quiz.score}% • {quiz.completionDate ? new Date(quiz.completionDate).toLocaleString() : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base lg:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <Link href="/live-quiz" className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left w-full block">
                <div className="font-medium text-sm lg:text-base">Join Live Quiz</div>
                <div className="text-xs lg:text-sm text-gray-600">Participate in real-time</div>
              </Link>
              <Link href="/result" className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left w-full block">
                <div className="font-medium text-sm lg:text-base">View Results</div>
                <div className="text-xs lg:text-sm text-gray-600">Check your scores</div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
} 
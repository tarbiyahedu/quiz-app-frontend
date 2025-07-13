"use client";

import StudentLayout from "@/app/layouts/student-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Trophy, Clock, Target, GraduationCap } from "lucide-react";

export default function StudentDashboardPage() {
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
              <div className="text-lg lg:text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +3 this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Average Score</CardTitle>
              <Target className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">12.5h</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Achievements</CardTitle>
              <Trophy className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Badges earned
              </p>
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
                <div className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-sm lg:text-base">JavaScript Fundamentals</h3>
                      <p className="text-xs lg:text-sm text-gray-600">Live Quiz • 30 minutes</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Live Now</span>
                  </div>
                </div>
                <div className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-sm lg:text-base">React Basics</h3>
                      <p className="text-xs lg:text-sm text-gray-600">Assignment • Due in 2 days</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Open</span>
                  </div>
                </div>
                <div className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-sm lg:text-base">Node.js Backend</h3>
                      <p className="text-xs lg:text-sm text-gray-600">Assignment • Due in 5 days</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Open</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm font-medium">Completed JavaScript Quiz</p>
                    <p className="text-xs text-gray-600">Score: 92% • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm font-medium">Started React Assignment</p>
                    <p className="text-xs text-gray-600">Progress: 60% • 1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm font-medium">Earned "Quick Learner" Badge</p>
                    <p className="text-xs text-gray-600">For completing 5 quizzes • 2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm font-medium">Joined Live Quiz Session</p>
                    <p className="text-xs text-gray-600">HTML & CSS Basics • 3 days ago</p>
                  </div>
                </div>
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
              <button className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="font-medium text-sm lg:text-base">Join Live Quiz</div>
                <div className="text-xs lg:text-sm text-gray-600">Participate in real-time</div>
              </button>
              <button className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="font-medium text-sm lg:text-base">Start Assignment</div>
                <div className="text-xs lg:text-sm text-gray-600">Work on assignments</div>
              </button>
              <button className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="font-medium text-sm lg:text-base">View Results</div>
                <div className="text-xs lg:text-sm text-gray-600">Check your scores</div>
              </button>
              <button className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                <div className="font-medium text-sm lg:text-base">Favorites</div>
                <div className="text-xs lg:text-sm text-gray-600">Saved quizzes</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
} 
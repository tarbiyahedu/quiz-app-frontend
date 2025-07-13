"use client";

import AdminLayout from "@/app/layouts/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Trophy, BarChart3, Crown } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0E2647]">Admin Dashboard</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1 lg:mt-2">Welcome to the admin control panel. Manage your quiz application from here.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Total Users</CardTitle>
              <Users className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Active Quizzes</CardTitle>
              <BookOpen className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">
                +5 new this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Completed Quizzes</CardTitle>
              <Trophy className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">892</div>
              <p className="text-xs text-muted-foreground">
                +12% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Average Score</CardTitle>
              <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold">78.5%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base lg:text-lg">
                <Crown className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-[#FAB364]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <button className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="font-medium text-sm lg:text-base">Create Quiz</div>
                  <div className="text-xs lg:text-sm text-gray-600">Set up a new quiz</div>
                </button>
                <button className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="font-medium text-sm lg:text-base">Manage Users</div>
                  <div className="text-xs lg:text-sm text-gray-600">View and edit users</div>
                </button>
                <button className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="font-medium text-sm lg:text-base">View Results</div>
                  <div className="text-xs lg:text-sm text-gray-600">Check quiz results</div>
                </button>
                <button className="p-3 lg:p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="font-medium text-sm lg:text-base">Settings</div>
                  <div className="text-xs lg:text-sm text-gray-600">Configure system</div>
                </button>
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
                    <p className="text-xs lg:text-sm font-medium">New user registered</p>
                    <p className="text-xs text-gray-600">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm font-medium">Quiz completed</p>
                    <p className="text-xs text-gray-600">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm font-medium">New quiz created</p>
                    <p className="text-xs text-gray-600">10 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm font-medium">User approved</p>
                    <p className="text-xs text-gray-600">15 minutes ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 
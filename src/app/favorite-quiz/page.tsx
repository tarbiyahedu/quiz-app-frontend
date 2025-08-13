"use client";

import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/ui/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Play, 
  Clock, 
  Users,
  Star,
  Search,
  Filter
} from "lucide-react";
import { useState } from "react";

export default function FavoriteQuizPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0E2647] border-t-transparent"></div>
      </div>
    );
  }

  const favoriteQuizzes = [
    {
      id: 1,
      title: "JavaScript Fundamentals",
      instructor: "Dr. Smith",
      type: "Live Quiz",
      duration: "30 min",
      questions: 20,
      participants: 45,
      rating: 4.8,
      category: "Programming",
      isLive: true,
      startTime: "2:00 PM"
    },
    {
      id: 2,
      title: "React Advanced Patterns",
      instructor: "Prof. Johnson",
      type: "Assignment",
      duration: "60 min",
      questions: 25,
      participants: 32,
      rating: 4.9,
      category: "Web Development",
      isLive: false,
      dueDate: "2024-01-25"
    },
    {
      id: 3,
      title: "Database Optimization",
      instructor: "Dr. Williams",
      type: "Live Quiz",
      duration: "45 min",
      questions: 18,
      participants: 28,
      rating: 4.7,
      category: "Database",
      isLive: false,
      startTime: "4:30 PM"
    },
    {
      id: 4,
      title: "System Design Principles",
      instructor: "Prof. Brown",
      type: "Assignment",
      duration: "90 min",
      questions: 30,
      participants: 15,
      rating: 4.6,
      category: "System Design",
      isLive: false,
      dueDate: "2024-01-30"
    }
  ];

  const filteredQuizzes = favoriteQuizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || quiz.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#0E2647]">Favorite Quiz</h1>
          <p className="text-gray-600 mt-2">Your saved and favorite quizzes for quick access.</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search favorite quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E2647] focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0E2647] focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="Live Quiz">Live Quiz</option>
              <option value="Assignment">Assignment</option>
            </select>
          </div>
        </div>

        {/* Favorite Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow relative">
              <div className="absolute top-4 right-4">
                <Heart className="h-6 w-6 text-red-500 fill-current" />
              </div>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">by {quiz.instructor}</p>
                  </div>
                  <Badge 
                    variant={quiz.isLive ? 'default' : 'secondary'}
                    className={quiz.isLive ? 'bg-green-100 text-green-800' : ''}
                  >
                    {quiz.isLive ? 'Live Now' : 'Upcoming'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{quiz.participants} participants</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{quiz.duration}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {quiz.category}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    {renderStars(quiz.rating)}
                    <span className="text-sm text-gray-600 ml-1">({quiz.rating})</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  {quiz.isLive ? (
                    <div className="flex items-center space-x-1">
                      <Play className="h-4 w-4 text-green-600" />
                      <span>Starts at {quiz.startTime}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span>Due: {quiz.dueDate}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {quiz.questions} questions
                  </span>
                  <Button 
                    className="bg-[#0E2647] hover:bg-[#FAB364]"
                    size="sm"
                  >
                    {quiz.isLive ? 'Join Now' : 'Start Quiz'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredQuizzes.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite quizzes found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or add some quizzes to your favorites.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-[#0E2647]">{favoriteQuizzes.length}</div>
              <div className="text-sm text-gray-600">Favorites</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <Play className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-[#0E2647]">
                {favoriteQuizzes.filter(q => q.type === 'Live Quiz').length}
              </div>
              <div className="text-sm text-gray-600">Live Quizzes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-[#0E2647]">
                {favoriteQuizzes.filter(q => q.type === 'Assignment').length}
              </div>
              <div className="text-sm text-gray-600">Assignments</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-6">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-[#0E2647]">
                {Math.round(favoriteQuizzes.reduce((acc, quiz) => acc + quiz.rating, 0) / favoriteQuizzes.length * 10) / 10}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Join Live Quiz</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Start Assignment</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Add More Favorites</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 
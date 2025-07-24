'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Crown, Download, BarChart3, TrendingUp, Clock, Target } from 'lucide-react';
import { liveLeaderboardAPI } from '@/lib/api';
import { publicQuizAPI } from '@/lib/api';

interface LeaderboardEntry {
  _id: string;
  user: {
    name: string;
    email: string;
    department: {
      name: string;
    };
  };
  score: number;
  timeTaken: number;
  accuracy: number;
  rank: number;
  quizTitle: string;
  completedAt: string;
}

interface ChartData {
  name: string;
  value: number;
}

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [publicQuizzes, setPublicQuizzes] = useState<any[]>([]);
  const [loadingPublic, setLoadingPublic] = useState(true);

  useEffect(() => {
    fetchPublicQuizzes();
    const interval = setInterval(() => {
      fetchPublicQuizzes();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPublicQuizzes = async () => {
    setLoadingPublic(true);
    try {
      const response = await publicQuizAPI.getAllPublic();
      setPublicQuizzes(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch public quizzes:', error);
    } finally {
      setLoadingPublic(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-600">{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (rank === 3) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const downloadResults = () => {
    console.log('Downloading results...');
  };

  const accuracyData: ChartData[] = [
    { name: '90-100%', value: 25 },
    { name: '80-89%', value: 35 },
    { name: '70-79%', value: 20 },
    { name: '60-69%', value: 15 },
    { name: 'Below 60%', value: 5 },
  ];

  const scoreProgressData = [
    { name: 'Week 1', score: 75 },
    { name: 'Week 2', score: 82 },
    { name: 'Week 3', score: 78 },
    { name: 'Week 4', score: 88 },
    { name: 'Week 5', score: 92 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Public Quizzes Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-[#0E2647]">Public Quizzes</h2>
          {loadingPublic ? (
            <div className="text-gray-500">Loading public quizzes...</div>
          ) : publicQuizzes.length === 0 ? (
            <div className="text-gray-500">No public quizzes available right now.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicQuizzes.map((quiz) => (
                <Card key={quiz._id} className="bg-white border rounded-xl shadow p-4 flex flex-col justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-[#0E2647]">{quiz.title}</CardTitle>
                    <CardDescription className="mb-2">{quiz.description}</CardDescription>
                    <div className="text-sm text-gray-600 mb-2">Department: {quiz.department?.name || 'All'}</div>
                  </div>
                  <Button className="mt-2 w-full bg-[#0E2647] hover:bg-[#FAB364] hover:text-[#0E2647]" asChild>
                    <a href={`/join/${quiz.code || quiz._id}`}>Join Quiz</a>
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
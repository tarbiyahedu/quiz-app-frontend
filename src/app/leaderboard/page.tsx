'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Crown, Download, BarChart3, TrendingUp, Clock, Target } from 'lucide-react';
import { liveLeaderboardAPI, assignmentLeaderboardAPI } from '@/lib/api';

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
  const [activeTab, setActiveTab] = useState('live');

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      if (activeTab === 'live') {
        const response = await liveLeaderboardAPI.getLeaderboard('all');
        setLeaderboardData(response.data.leaderboard || []);
      } else {
        const response = await assignmentLeaderboardAPI.getLeaderboard('all');
        setLeaderboardData(response.data.leaderboard || []);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-[#0E2647] mb-4">Leaderboard</h1>
          <p className="text-lg text-gray-600">Track performance and compete with peers</p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-6 py-2 rounded-md transition-all duration-300 ${
                activeTab === 'live'
                  ? 'bg-[#0E2647] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#0E2647]'
              }`}
            >
              Live Quizzes
            </button>
            <button
              onClick={() => setActiveTab('assignment')}
              className={`px-6 py-2 rounded-md transition-all duration-300 ${
                activeTab === 'assignment'
                  ? 'bg-[#0E2647] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#0E2647]'
              }`}
            >
              Assignment Quizzes
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard Table */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-[#0E2647]">
                      Top Performers
                    </CardTitle>
                    <CardDescription>
                      {activeTab === 'live' ? 'Live Quiz' : 'Assignment Quiz'} Leaderboard
                    </CardDescription>
                  </div>
                  <Button onClick={downloadResults} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0E2647]"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaderboardData.slice(0, 10).map((entry, index) => (
                      <motion.div
                        key={entry._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10">
                            {getRankIcon(entry.rank)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#0E2647]">
                              {entry.user.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {entry.user.department.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-lg font-bold text-[#0E2647]">
                              {entry.score}
                            </p>
                            <p className="text-xs text-gray-600">Score</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-700">
                              {formatTime(entry.timeTaken)}
                            </p>
                            <p className="text-xs text-gray-600">Time</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-green-600">
                              {entry.accuracy}%
                            </p>
                            <p className="text-xs text-gray-600">Accuracy</p>
                          </div>
                          <Badge className={getRankBadge(entry.rank)}>
                            #{entry.rank}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Statistics Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="space-y-6"
          >
            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Performance Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Score</span>
                  <span className="font-semibold text-[#0E2647]">78.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Participants</span>
                  <span className="font-semibold text-[#0E2647]">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Quizzes</span>
                  <span className="font-semibold text-[#0E2647]">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Top Score</span>
                  <span className="font-semibold text-green-600">98%</span>
                </div>
              </CardContent>
            </Card>

            {/* Winner Highlights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5" />
                  Winner Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <Crown className="h-6 w-6 text-yellow-500" />
                    <div>
                      <p className="font-semibold text-[#0E2647]">John Doe</p>
                      <p className="text-sm text-gray-600">Computer Science</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Medal className="h-6 w-6 text-gray-400" />
                    <div>
                      <p className="font-semibold text-[#0E2647]">Jane Smith</p>
                      <p className="text-sm text-gray-600">Mathematics</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
                    <Trophy className="h-6 w-6 text-amber-600" />
                    <div>
                      <p className="font-semibold text-[#0E2647]">Mike Johnson</p>
                      <p className="text-sm text-gray-600">Physics</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View My Progress
                </Button>
                <Button className="w-full" variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  Set Goals
                </Button>
                <Button className="w-full" variant="outline">
                  <Clock className="mr-2 h-4 w-4" />
                  Recent Activity
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 
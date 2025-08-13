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
  const [completedPublicQuizzes, setCompletedPublicQuizzes] = useState<any[]>([]);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  const [completedError, setCompletedError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'results' | 'completed'>('available');
  // Show thank you message if redirected after submit
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('success') === '1') {
        setShowSuccess(true);
        const nextUrl = params.get('next');
        if (nextUrl) {
          setTimeout(() => {
            window.location.href = nextUrl;
          }, 2000); // Show message for 2 seconds then redirect
        } else {
          setTimeout(() => setShowSuccess(false), 5000);
        }
      }
    }
  }, []);

  useEffect(() => {
    fetchPublicQuizzes();
    const interval = setInterval(() => {
      fetchPublicQuizzes();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'results') {
      fetchCompletedPublicQuizzes();
    }
  }, [activeTab]);

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

  const fetchCompletedPublicQuizzes = async () => {
    setLoadingCompleted(true);
    try {
      setCompletedError(null);
      console.log('[Leaderboard] Fetching completed public quizzes...');
  const response = await fetch('https://quiz-app-backend-pi.vercel.app/api/live-leaderboard/public-completed');
  // const response = await fetch('http://localhost:5000/api/live-leaderboard/public-completed');
      console.log('[Leaderboard] Response status:', response.status);
      if (!response.ok) {
        setCompletedError(`API error: ${response.status} ${response.statusText}`);
        setCompletedPublicQuizzes([]);
        return;
      }
      const data = await response.json();
      console.log('[Leaderboard] Response data:', data);
      if (!data.success) {
        setCompletedError(`Backend error: ${data.message || 'Unknown error'}`);
        setCompletedPublicQuizzes([]);
        return;
      }
      setCompletedPublicQuizzes(data.data || []);
    } catch (error) {
      console.error('[Leaderboard] Error fetching completed public quizzes:', error);
      setCompletedError(`Fetch error: ${error}`);
      setCompletedPublicQuizzes([]);
    } finally {
      setLoadingCompleted(false);
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
    <div className="min-h-screen bg-gray-50 py-8 flex flex-col items-center">
      {showSuccess && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-6 py-3 rounded-xl mb-4 text-center font-semibold shadow">
          Thank you and submit success!
        </div>
      )}
      <div className="w-full max-w-4xl px-4 flex flex-col items-center">
        <div className="mb-8 flex gap-4 border-b pb-2 justify-center w-full">
          <Button
            variant={activeTab === 'available' ? 'default' : 'outline'}
            className={activeTab === 'available' ? 'font-bold bg-[#0E2647] text-white' : ''}
            onClick={() => setActiveTab('available')}
          >
            Available Public Quizzes
          </Button>
          <Button
            variant={activeTab === 'results' ? 'default' : 'outline'}
            className={activeTab === 'results' ? 'font-bold bg-[#0E2647] text-white' : ''}
            onClick={() => setActiveTab('results')}
          >
            Complete Public Quiz Results
          </Button>
        </div>
        {activeTab === 'available' && (
          <div className="mb-10 w-full flex flex-col items-center">
            {loadingPublic ? (
              <div className="text-gray-500 text-center">Loading public quizzes...</div>
            ) : publicQuizzes.length === 0 ? (
              <div className="text-gray-500 text-center">No public quizzes available right now.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full justify-center">
                {publicQuizzes.map((quiz) => (
                  <Card key={quiz._id} className="bg-white border rounded-xl shadow p-4 flex flex-col justify-between items-center">
                    <div className="w-full text-center">
                      <CardTitle className="text-lg font-bold text-[#0E2647]">{quiz.title}</CardTitle>
                      <CardDescription className="mb-2">{quiz.description}</CardDescription>
                      <div className="text-sm text-gray-600 mb-2">Department: {quiz.department?.name || 'All'}</div>
                    </div>
                    <Button className="mt-2 w-full bg-[#0E2647] hover:bg-[#FAB364]" asChild>
                      <a href={`/join/${quiz.code || quiz._id}`}>Join Quiz</a>
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'results' && (
            <div className="mb-10 w-full flex flex-col items-center">
              <h2 className="text-xl font-bold mb-4 text-[#0E2647] text-center">Complete Public Quiz Results</h2>
              {loadingCompleted ? (
                <div className="text-gray-500 text-center">Loading completed public quizzes...</div>
              ) : completedError ? (
                <div className="text-red-600 text-center font-bold">{completedError}</div>
              ) : completedPublicQuizzes.length === 0 ? (
                <div className="text-gray-500 text-center">No completed public quizzes found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full justify-center">
                  {completedPublicQuizzes.map((quiz) => (
                    <div key={quiz._id} className="bg-white border rounded-xl shadow p-4 flex flex-col justify-between items-center">
                      <div className="w-full text-center">
                        <div className="text-lg font-bold text-[#0E2647]">{quiz.title}</div>
                        <div className="mb-2 text-gray-600">{quiz.description}</div>
                        <div className="text-sm text-gray-500 mb-2">Ended: {quiz.endTime ? new Date(quiz.endTime).toLocaleString() : 'N/A'}</div>
                      </div>
                      <Button className="mt-2 w-full bg-[#FAB364] hover:bg-[#0E2647] text-[#0E2647] hover:text-white" asChild>
                        <a href={`/leaderboard/${quiz._id}`}>View Report</a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
        )}
  {/* Removed Completed Public Quizzes tab and content */}
      </div>
    </div>
  );
} 
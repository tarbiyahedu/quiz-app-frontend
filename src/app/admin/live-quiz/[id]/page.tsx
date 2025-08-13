"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { liveQuizAPI } from '@/lib/api';
import { liveQuizQuestionAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Share2, Play, Square, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Link from "next/link";
import LiveParticipantsPanel from "./LiveParticipantsPanel";

export default function AdminLiveQuizDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const quizId = params.id as string;
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [liveLoading, setLiveLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    liveStartAt: '',
    liveEndAt: ''
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== 'admin') {
        router.replace("/403");
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await liveQuizAPI.getQuizById(quizId);
        setQuiz(res.data.data);
      } catch (e) {
        setError("Quiz not found");
      }
    };
    if (user && user.role === 'admin') fetchQuiz();
  }, [quizId, user]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await liveQuizQuestionAPI.getQuestionsByQuiz(quizId);
        setQuestions(res.data.data || []);
      } catch (e) {
        setQuestions([]);
      }
    };
    if (user && user.role === 'admin') fetchQuestions();
  }, [quizId, user]);

  // Live On/Off Button logic
  const handleToggleLive = async () => {
    setLiveLoading(true);
    try {
      if (quiz.isLive) {
        await liveQuizAPI.endQuiz(quizId);
        setQuiz((q: any) => ({ ...q, status: 'completed', isLive: false }));
        toast({ title: 'Quiz Ended', description: 'The quiz has been ended successfully.' });
      } else {
        await liveQuizAPI.startQuiz(quizId);
        setQuiz((q: any) => ({ ...q, status: 'live', isLive: true }));
        toast({ title: 'Quiz Started', description: 'The quiz is now live!' });
      }
    } catch (e: any) {
      toast({ 
        title: 'Error', 
        description: e.message || 'Failed to toggle quiz status', 
        variant: 'destructive' 
      });
    } finally {
      setLiveLoading(false);
    }
  };

  // Schedule quiz
  const handleScheduleQuiz = async () => {
    if (!scheduleData.liveStartAt || !scheduleData.liveEndAt) {
      toast({ 
        title: 'Error', 
        description: 'Please select both start and end times', 
        variant: 'destructive' 
      });
      return;
    }

    // Convert local datetime to UTC ISO string
    const liveStartAtUTC = new Date(scheduleData.liveStartAt).toISOString();
    const liveEndAtUTC = new Date(scheduleData.liveEndAt).toISOString();

    setScheduleLoading(true);
    try {
      await liveQuizAPI.scheduleQuiz(quizId, {
        liveStartAt: liveStartAtUTC,
        liveEndAt: liveEndAtUTC
      });
      setQuiz((q: any) => ({ 
        ...q, 
        status: 'scheduled', 
        liveStartAt: liveStartAtUTC,
        liveEndAt: liveEndAtUTC 
      }));
      setShowSchedule(false);
      toast({ title: 'Quiz Scheduled', description: 'The quiz has been scheduled successfully.' });
    } catch (e: any) {
      toast({ 
        title: 'Error', 
        description: e.message || 'Failed to schedule quiz', 
        variant: 'destructive' 
      });
    } finally {
      setScheduleLoading(false);
    }
  };

  // Cancel schedule
  const handleCancelSchedule = async () => {
    setScheduleLoading(true);
    try {
      await liveQuizAPI.cancelSchedule(quizId);
      setQuiz((q: any) => ({ 
        ...q, 
        status: 'draft', 
        liveStartAt: null,
        liveEndAt: null 
      }));
      toast({ title: 'Schedule Cancelled', description: 'The quiz schedule has been cancelled.' });
    } catch (e: any) {
      toast({ 
        title: 'Error', 
        description: e.message || 'Failed to cancel schedule', 
        variant: 'destructive' 
      });
    } finally {
      setScheduleLoading(false);
    }
  };

  if (loading || !user) return <div>Loading...</div>;
  if (user.role !== 'admin') return null;
  if (error) return <div>{error}</div>;
  if (!quiz) return <div>Loading quiz details...</div>;

  // Generate join link and code
  const joinLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tarbiyah-live-quiz-app.vercel.app'}/join/${quiz.code || quizId}`;
  const joinCode = quiz.code || quizId.slice(-6).toUpperCase();
  const invitationText = `Join the quiz: ${quiz.title}\nLink: ${joinLink}\nCode: ${joinCode}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex gap-8 max-w-6xl mx-auto mt-8">
      {/* Main Content */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <div className="mb-2 text-gray-700">{quiz.description}</div>
        <span className="mb-2 text-sm text-gray-600">
          Department: {
            Array.isArray(quiz.departments) && quiz.departments.length > 0
              ? quiz.departments.map((d: any) => d?.name || d).join(", ")
              : quiz.department?.name || quiz.department || "-"
          }
        </span>
        <span className="mb-4 px-5">
          <Badge className={getStatusColor(quiz.status)}>{quiz.status}</Badge>
          {quiz.isLive && <Badge className="ml-2 bg-red-100 text-red-800">LIVE NOW</Badge>}
        </span>
        
        {quiz.status === 'scheduled' && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Scheduled Times</h3>
            <div className="text-sm text-blue-700">
              <div>Start: {formatDate(quiz.liveStartAt)}</div>
              <div>End: {formatDate(quiz.liveEndAt)}</div>
            </div>
          </div>
        )}
        {/* Live Participants Section */}
        <LiveParticipantsPanel quizId={quizId} showControls={false} />
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Questions ({questions.length})</h2>
          {questions.length === 0 ? (
            <div>No questions found for this quiz.</div>
          ) : (
            <ul className="space-y-4">
              {questions.map((q, idx) => (
                <li key={q._id} className="p-4 bg-white rounded shadow">
                  <div className="font-semibold">Q{idx + 1}: {q.questionText}</div>
                  <div className="text-sm text-gray-600 mt-1">Type: {q.type}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-96 bg-white rounded-xl shadow p-6 flex flex-col gap-6 border border-gray-200">
        {/* Live Control Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Live Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className={quiz.isLive ? 'bg-red-600 hover:bg-red-700 text-white w-full' : 'bg-green-600 hover:bg-green-700 text-white w-full'}
              onClick={handleToggleLive}
              disabled={liveLoading}
            >
              {liveLoading ? (
                'Processing...'
              ) : quiz.isLive ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  End Live Quiz
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Live Quiz
                </>
              )}
            </Button>
            {/* New See Live Overview Link */}
            <div className="text-center mt-2">
              <Link href={`/admin/live-quiz/${quizId}/start`} className="text-blue-600 hover:underline text-sm font-medium">
                See Live Overview
              </Link>
            </div>
            <div className="text-center">
              <span className={quiz.isLive ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                {quiz.isLive ? 'Quiz is LIVE' : 'Quiz is not live'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Live Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quiz.status === 'scheduled' ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <div>Start: {formatDate(quiz.liveStartAt)}</div>
                  <div>End: {formatDate(quiz.liveEndAt)}</div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleCancelSchedule}
                  disabled={scheduleLoading}
                  className="w-full"
                >
                  {scheduleLoading ? 'Cancelling...' : 'Cancel Schedule'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={scheduleData.liveStartAt}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, liveStartAt: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={scheduleData.liveEndAt}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, liveEndAt: e.target.value }))}
                  />
                </div>
                <Button
                  onClick={handleScheduleQuiz}
                  disabled={scheduleLoading || !scheduleData.liveStartAt || !scheduleData.liveEndAt}
                  className="w-full"
                >
                  {scheduleLoading ? 'Scheduling...' : 'Schedule Quiz'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Share Section */}
        <Card>
          <CardHeader>
            <CardTitle>Share Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Shareable Link</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input type="text" value={joinLink} readOnly className="text-sm" />
                <Button size="icon" variant="outline" className="cursor-pointer" onClick={() => {
                  navigator.clipboard.writeText(joinLink);
                  toast({ title: 'Link copied!', description: 'Shareable link copied to clipboard.', duration: 2000 });
                }}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label>Quiz Join Code</Label>
              <div className="text-2xl font-mono font-bold tracking-widest bg-gray-100 rounded px-3 py-2 mt-1 text-center">
                {joinCode}
              </div>
            </div>
            
            <div>
              <Label>QR Code</Label>
              <div className="flex justify-center mt-1">
                <QRCodeCanvas value={joinLink} size={128} />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => window.open(`https://teams.microsoft.com/share?href=${encodeURIComponent(joinLink)}`)}>
                <Share2 className="w-4 h-4 mr-2" />Teams
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => window.open(`https://classroom.google.com/share?url=${encodeURIComponent(joinLink)}`)}>
                <Share2 className="w-4 h-4 mr-2" />Classroom
              </Button>
            </div>
            
            <Button 
              className="w-full bg-[#FAB364] text-[#0E2647] font-bold" 
              onClick={() => {
                navigator.clipboard.writeText(invitationText);
                toast({ title: 'Invitation copied!', description: 'Invitation text copied to clipboard.', duration: 2000 });
              }}
            >
              Copy Invitation
            </Button>
          </CardContent>
        </Card>

        {/* Live History */}
        {quiz.liveHistory && quiz.liveHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Live History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quiz.liveHistory.map((session: any, index: number) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                    <div className="font-medium">Session {index + 1}</div>
                    <div>Started: {formatDate(session.startedAt)}</div>
                    {session.endedAt && (
                      <>
                        <div>Ended: {formatDate(session.endedAt)}</div>
                        <div>Duration: {session.duration} minutes</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </aside>
    </div>
  );
} 
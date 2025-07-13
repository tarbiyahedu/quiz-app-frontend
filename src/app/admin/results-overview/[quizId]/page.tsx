"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { liveQuizAnswerAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminQuizResultsDetailPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const response = await liveQuizAnswerAPI.getCompletedQuizDetailsForAdmin(quizId);
        setQuizData(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch quiz data");
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading quiz results...</p>
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

  if (!quizData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">No Data Found</h2>
            <p className="text-gray-500">No quiz results available for this quiz.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Quiz Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{quizData.title}</h1>
          <p className="text-gray-600 mb-4">{quizData.description}</p>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <Badge variant="outline" className="text-sm">
              Department: {quizData.department}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Created by: {quizData.createdBy}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Status: {quizData.status}
            </Badge>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{quizData.totalParticipants}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{quizData.totalQuestions}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{quizData.averageScore}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Average Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{quizData.averageAccuracy}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Possible Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{quizData.totalPossibleScore}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="questions">Questions & Answers</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Correct Answers</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Time (min)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quizData.leaderboard.map((participant: any) => (
                      <TableRow key={participant.userId}>
                        <TableCell className="font-medium">{participant.rank}</TableCell>
                        <TableCell>{participant.name}</TableCell>
                        <TableCell>{participant.email}</TableCell>
                        <TableCell>{participant.department}</TableCell>
                        <TableCell className="font-bold text-green-600">{participant.totalScore}</TableCell>
                        <TableCell>{participant.correctAnswers}/{participant.totalQuestions}</TableCell>
                        <TableCell>{participant.correctAnswers > 0 ? Math.round((participant.correctAnswers / participant.totalQuestions) * 100) : 0}%</TableCell>
                        <TableCell>{participant.totalTime}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="mt-6">
            <div className="space-y-6">
              {quizData.questions.map((question: any, qIndex: number) => (
                <Card key={question.questionId}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          Question {qIndex + 1}: {question.questionText}
                        </CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{question.type}</Badge>
                          <Badge variant="outline">{question.marks} marks</Badge>
                          <Badge variant="outline">{question.accuracy}% accuracy</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Correct Answer:</h4>
                      <p className="text-green-600 bg-green-50 p-2 rounded">
                        {Array.isArray(question.correctAnswer) 
                          ? question.correctAnswer.join(', ') 
                          : question.correctAnswer}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Participant Answers:</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Answer</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Time (sec)</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {quizData.participants.map((participant: any) => {
                            const answer = participant.answers.find((a: any) => a.questionId === question.questionId);
                            return (
                              <TableRow key={participant.userId}>
                                <TableCell className="font-medium">{participant.name}</TableCell>
                                <TableCell>
                                  {answer ? (
                                    Array.isArray(answer.userAnswer) 
                                      ? answer.userAnswer.join(', ') 
                                      : answer.userAnswer
                                  ) : (
                                    <span className="text-gray-400">Not answered</span>
                                  )}
                                </TableCell>
                                <TableCell>{answer ? answer.score : 0}</TableCell>
                                <TableCell>{answer ? answer.timeTaken : '-'}</TableCell>
                                <TableCell>
                                  {answer ? (
                                    <Badge variant={answer.isCorrect ? "default" : "destructive"}>
                                      {answer.isCorrect ? "Correct" : "Incorrect"}
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">Not answered</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 
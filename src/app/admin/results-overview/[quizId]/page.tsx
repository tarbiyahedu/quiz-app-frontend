"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { liveQuizAnswerAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/ui/dashboard-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fontClass } from '@/lib/fontScript';

export default function AdminQuizResultsDetailPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Only one composite key can be in edit mode at a time
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ [key: string]: any }>({});
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    let isMounted = true;
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const response = await liveQuizAnswerAPI.getCompletedQuizDetailsForAdmin(quizId);
        if (isMounted) setQuizData(response.data.data);
      } catch (err: any) {
        if (isMounted) setError(err.response?.data?.message || "Failed to fetch quiz data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (quizId) {
      fetchQuizData();
    }
    return () => { isMounted = false; };
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


  if (!quizData || typeof quizData !== 'object') {
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

  const handleExportExcel = () => {
    if (!quizData) return;
    // Use leaderboard data, sorted by rank
    const leaderboard = (quizData.leaderboard || []).slice().sort((a: any, b: any) => a.rank - b.rank);
    const wsData = [
      ['Rank', 'Name', 'Email', 'Department', 'Score', 'Answered', 'Correct', 'Accuracy'],
      ...leaderboard.map((p: any) => [
        p.rank,
        p.name,
        p.email,
        p.department,
        p.totalScore,
        `${p.correctAnswers}/${p.totalQuestions}`,
        p.correctAnswers,
        p.correctAnswers > 0 ? Math.round((p.correctAnswers / p.totalQuestions) * 100) : 0
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leaderboard');
    XLSX.writeFile(wb, `${quizData.title || 'quiz-leaderboard'}.xlsx`);
  };

  const handleExportPDF = () => {
    if (!quizData) return;
    // Use leaderboard data, sorted by rank
    const leaderboard = (quizData.leaderboard || []).slice().sort((a: any, b: any) => a.rank - b.rank);
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(quizData.title || 'Quiz Leaderboard', 14, 18);
    doc.setFontSize(12);
    doc.text(`Department: ${quizData.department}`, 14, 28);
    doc.text(`Total Questions: ${quizData.totalQuestions}`, 14, 36);
    doc.text(`Total Participants: ${quizData.totalParticipants}`, 14, 44);
    doc.text(`Average Score: ${quizData.averageScore}%`, 14, 52);
    doc.text(`Average Accuracy: ${quizData.averageAccuracy}%`, 14, 60);
    autoTable(doc, {
      startY: 70,
      head: [[
        'Rank', 'Name', 'Email', 'Department', 'Score', 'Answered', 'Correct', 'Accuracy'
      ]],
      body: leaderboard.map((p: any) => [
        p.rank,
        p.name,
        p.email,
        p.department,
        p.totalScore,
        `${p.correctAnswers}/${p.totalQuestions}`,
        p.correctAnswers,
        p.correctAnswers > 0 ? Math.round((p.correctAnswers / p.totalQuestions) * 100) : 0
      ]),
      styles: { fontSize: 8, cellWidth: 'auto', overflow: 'linebreak' },
      headStyles: { fillColor: [22, 82, 147] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 28 },
        2: { cellWidth: 38 },
        3: { cellWidth: 24 },
        4: { cellWidth: 14 },
        5: { cellWidth: 22 },
        6: { cellWidth: 14 },
        7: { cellWidth: 16 }
      }
    });
    doc.save(`${quizData.title || 'quiz-leaderboard'}.pdf`);
  };

  // Helper to start editing an answer
  const handleEdit = (answer: any, participant: any) => {
    const key = participant.userId + '-' + answer.questionId;
    console.log('Edit clicked for key:', key, 'answer:', answer);
    setEditingKey(key);
    setEditValues((prev) => ({
      ...prev,
      [key]: {
        answerText: answer.userAnswer,
        isCorrect: answer.isCorrect,
        score: answer.score,
        reviewNotes: answer.reviewNotes || '',
      },
    }));
  };

  // Helper to cancel editing
  const handleCancel = (key: string) => {
    console.log('Cancel clicked for key:', key);
    setEditingKey(null);
    setEditValues((prev) => {
      const newVals = { ...prev };
      delete newVals[key];
      return newVals;
    });
  };

  // Helper to save changes
  const handleSave = async (answer: any, participant: any) => {
    const key = participant.userId + '-' + answer.questionId;
    console.log('Save clicked for key:', key, 'with values:', editValues[key]);
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      // Find the correct answer object from participant.answers
      const answerObj = participant.answers.find((a: any) => a.questionId === answer.questionId);
      if (!answerObj) throw new Error('Answer object not found for save');
      // Try to use answerObj._id, answerObj.id, or answerObj.answerId
      const answerId = answerObj._id || answerObj.id || answerObj.answerId;
      if (!answerId) throw new Error('Answer ID not found for save');
      await liveQuizAnswerAPI.updateAnswer(answerId, editValues[key]);
      setEditingKey(null);
      setEditValues((prev) => {
        const newVals = { ...prev };
        delete newVals[key];
        return newVals;
      });
      // Refresh data
      const response = await liveQuizAnswerAPI.getCompletedQuizDetailsForAdmin(quizId);
      setQuizData(response.data.data);
    } catch (err: any) {
      alert("Failed to save changes: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Quiz Header */}
        <div className="mb-6">
          <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${fontClass(quizData.title)}`}>{quizData.title}</h1>
          <p className={`text-gray-600 mb-4 ${fontClass(quizData.description)}`}>{quizData.description}</p>
          
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
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

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {quizData.totalParticipants > 0 ? 
                    Math.round((quizData.participants.reduce((sum: number, p: any) => sum + p.answeredQuestions, 0) / 
                    (quizData.totalParticipants * quizData.totalQuestions)) * 100) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add a summary table of all participants at the top */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Participant Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Correct</TableHead>
                  <TableHead>Accuracy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(quizData.participants || []).map((participant: any) => (
                  <TableRow key={participant.userId}>
                    <TableCell>{participant.name}</TableCell>
                    <TableCell>{participant.email}</TableCell>
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

        {/* Tabs */}
        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="questions">Questions & Answers</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quiz Leaderboard</CardTitle>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={handleExportExcel}>Download as Excel</Button>
                    <Button variant="outline" onClick={handleExportPDF}>Download as PDF</Button>
                  </div>
                </div>
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
                      <TableHead>Answered</TableHead>
                      <TableHead>Correct</TableHead>
                      <TableHead>Accuracy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(quizData.leaderboard || []).map((participant: any) => (
                      <TableRow key={participant.userId}>
                        <TableCell className="font-medium">{participant.rank}</TableCell>
                        <TableCell>{participant.name}</TableCell>
                        <TableCell>{participant.email}</TableCell>
                        <TableCell>{participant.department}</TableCell>
                        <TableCell className="font-bold text-green-600">{participant.totalScore}</TableCell>
                        <TableCell>{participant.correctAnswers}/{participant.totalQuestions}</TableCell>
                        <TableCell>{participant.correctAnswers}</TableCell>
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
              {(quizData.questions || []).map((question: any, qIndex: number) => (
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
                            <TableHead>Review Notes</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {quizData.participants.map((participant: any) => {
                            const answer = participant.answers.find((a: any) => a.questionId === question.questionId);
                            if (!answer) {
                              return (
                                <TableRow key={participant.userId}>
                                  <TableCell className="font-medium">{participant.name}</TableCell>
                                  <TableCell colSpan={6}><span className="text-gray-400">Not answered</span></TableCell>
                                </TableRow>
                              );
                            }
                            const key = participant.userId + '-' + answer.questionId;
                            const isEditing = editingKey === key;
                            const editVal = editValues[key] || {};
                            return (
                              <TableRow key={participant.userId}>
                                <TableCell className="font-medium">{participant.name}</TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <input
                                      className="border rounded px-2 py-1 w-full"
                                      value={editVal.answerText}
                                      onChange={e => setEditValues((prev) => ({ ...prev, [key]: { ...editVal, answerText: e.target.value } }))}
                                    />
                                  ) : (
                                    Array.isArray(answer.userAnswer)
                                      ? answer.userAnswer.join(', ')
                                      : answer.userAnswer
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      className="border rounded px-2 py-1 w-16"
                                      value={editVal.score}
                                      onChange={e => setEditValues((prev) => ({ ...prev, [key]: { ...editVal, score: Number(e.target.value) } }))}
                                    />
                                  ) : (
                                    answer.score
                                  )}
                                </TableCell>
                                <TableCell>{answer.timeTaken}</TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <select
                                      className="border rounded px-2 py-1"
                                      value={editVal.isCorrect ? 'true' : 'false'}
                                      onChange={e => setEditValues((prev) => ({ ...prev, [key]: { ...editVal, isCorrect: e.target.value === 'true' } }))}
                                    >
                                      <option value="true">Correct</option>
                                      <option value="false">Incorrect</option>
                                    </select>
                                  ) : (
                                    <Badge variant={answer.isCorrect ? "default" : "destructive"}>
                                      {answer.isCorrect ? "Correct" : "Incorrect"}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <textarea
                                      className="border rounded px-2 py-1 w-full"
                                      value={editVal.reviewNotes || ''}
                                      onChange={e => setEditValues((prev) => ({ ...prev, [key]: { ...editVal, reviewNotes: e.target.value } }))}
                                      placeholder="Add review notes (optional)"
                                      rows={2}
                                    />
                                  ) : (
                                    answer.reviewNotes ? (
                                      <span className="text-xs text-gray-500">{answer.reviewNotes}</span>
                                    ) : null
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditing ? (
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="default" disabled={saving[key]} onClick={() => handleSave(answer, participant)}>
                                        {saving[key] ? 'Saving...' : 'Save'}
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => handleCancel(key)}>Cancel</Button>
                                    </div>
                                  ) : (
                                    <div>
                                      {/* Fix: Always pass the correct answer object to handleEdit */}
                                      <Button size="sm" variant="outline" onClick={() => handleEdit(answer, participant)}>Edit</Button>
                                      {Array.isArray(answer.auditLogs) && answer.auditLogs.length > 0 && (
                                        <details className="mt-2">
                                          <summary className="cursor-pointer text-xs text-blue-600">View Audit Logs ({answer.auditLogs.length})</summary>
                                          <div className="bg-gray-50 border rounded p-2 mt-1 max-h-40 overflow-y-auto">
                                            {answer.auditLogs.map((log: any, idx: number) => (
                                              <div key={idx} className="mb-2 border-b pb-1">
                                                <div className="text-xs text-gray-700 font-semibold">{log.fieldsChanged.join(', ')}</div>
                                                <div className="text-xs text-gray-500">By: {log.adminId || 'Admin'} on {log.timestamp ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm') : ''}</div>
                                                <div className="text-xs text-gray-600">Old: {JSON.stringify(log.oldValue)}</div>
                                                <div className="text-xs text-gray-600">New: {JSON.stringify(log.newValue)}</div>
                                              </div>
                                            ))}
                                          </div>
                                        </details>
                                      )}
                                    </div>
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
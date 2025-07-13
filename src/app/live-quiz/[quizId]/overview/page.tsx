"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function LiveQuizOverviewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const quizRes = await api.get(`/live-quizzes/${quizId}`);
        setQuiz(quizRes.data.data);
        const qRes = await api.get(`/live-quiz-questions/quiz/${quizId}`);
        setQuestions(qRes.data.data || []);
        const aRes = await api.get(`/live-quiz-answers/user/${user._id}`);
        setAnswers(aRes.data.data?.filter((a: any) => a.quizId === quizId) || []);
        const lbRes = await api.get(`/live-leaderboard/quiz/${quizId}`);
        setLeaderboard(lbRes.data.leaderboard || []);
      } catch (e) {
        // handle error
      } finally {
        setLoadingPage(false);
      }
    }
    if (user) fetchOverview();
  }, [quizId, user]);

  if (loading || loadingPage) return <div>Loading...</div>;
  if (!user) return <div>Please log in to view your results.</div>;
  if (!quiz) return <div>Quiz not found.</div>;

  // Map answers by questionId for easy lookup
  const answerMap = Object.fromEntries(answers.map((a: any) => [a.questionId, a.answerText]));

  // Find user's leaderboard entry
  const myRank = leaderboard.findIndex((entry: any) => entry.userId === user._id) + 1;
  const myScore = leaderboard.find((entry: any) => entry.userId === user._id)?.score;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Quiz Overview: {quiz.title}</h1>
      <div className="mb-6">
        <div className="font-semibold">Your Score: <span className="text-blue-600">{myScore ?? 'N/A'}</span></div>
        <div className="font-semibold">Your Rank: <span className="text-green-600">{myRank > 0 ? myRank : 'N/A'}</span></div>
      </div>
      <h2 className="text-xl font-bold mb-2">Your Answers</h2>
      <ul className="space-y-4 mb-8">
        {questions.map((q: any, idx: number) => {
          const userAnswer = answerMap[q._id];
          const correct = userAnswer === q.correctAnswer;
          return (
            <li key={q._id} className="p-4 bg-gray-50 rounded border">
              <div className="mb-2 font-semibold">Q{idx + 1}: {q.questionText}</div>
              <div className="mb-1">Your Answer: <span className={correct ? "text-green-600" : "text-red-600"}>{userAnswer ?? 'No answer'}</span></div>
              <div>Correct Answer: <span className="text-blue-600">{q.correctAnswer}</span></div>
              <div>Mark: <span className="font-bold">{correct ? q.marks : 0}</span></div>
            </li>
          );
        })}
      </ul>
      <h2 className="text-xl font-bold mb-2">Leaderboard</h2>
      <table className="w-full mb-4 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left">Rank</th>
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry: any, idx: number) => (
            <tr key={entry.userId} className={entry.userId === user._id ? "bg-blue-50" : ""}>
              <td className="py-2 px-4">{idx + 1}</td>
              <td className="py-2 px-4">{entry.name}</td>
              <td className="py-2 px-4">{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button onClick={() => router.push("/dashboard")} className="mt-4">Back to Dashboard</Button>
    </div>
  );
} 
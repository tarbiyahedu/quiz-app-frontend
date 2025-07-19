"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from '@/lib/auth-context';

// Quiz type for display
interface Quiz {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  schedule?: string;
}

export default function LiveQuizStudentDashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        // No need to pass department parameter as the backend will handle multiple departments
        const res = await api.get("/live-quizzes/available");
        setQuizzes(res.data.data || []);
      } catch (e: any) {
        setError(e.message || "Failed to load quizzes");
      }
      setLoading(false);
    };
    if (user) fetchQuizzes();
  }, [user]);


  
  if (loading) return <div>Loading quizzes...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Available Live Quizzes</h1>
      {quizzes.length === 0 ? (
        <div className="text-gray-500">No live quizzes available for your departments.</div>
      ) : (
        <div className="container max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <Card key={quiz._id} className="max-w-md w-full mx-auto shadow rounded-xl border border-gray-200 bg-white">
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">{quiz.description}</div>
                <div className="mb-2 text-sm text-gray-600">Time Limit: {quiz.timeLimit} min</div>
                <Button onClick={() => router.push(`/quiz/${quiz._id}/live`)}>Join Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 

